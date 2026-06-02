import pool from "../db.js";
import PDFDocument from "pdfkit";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";

export async function getScheduleReport(depotId, startDate, endDate) {
  const query = `
        SELECT s.schedule_id, s.schedule_date, s.departure_time, s.arrival_time, s.status,
               r.route_name, v.plate_number, u.full_name as driver_name
        FROM schedule s
        JOIN route r ON s.route_id = r.route_id
        JOIN vehicle v ON s.vehicle_id = v.vehicle_id
        JOIN driver d ON s.driver_id = d.driver_id
        JOIN "user" u ON d.user_id = u.user_id
        WHERE s.depot_id = $1
          AND s.schedule_date BETWEEN $2 AND $3
        ORDER BY s.schedule_date, s.departure_time
    `;
  const result = await pool.query(query, [depotId, startDate, endDate]);
  return result.rows;
}

export async function getMaintenanceReport(
  depotId,
  startDate,
  endDate,
  vehicleId = null
) {
  let query = `
        SELECT m.maintenance_id, m.type, m.service_date, m.description, m.status,
               v.plate_number, v.vehicle_id
        FROM maintenance m
        JOIN vehicle v ON m.vehicle_id = v.vehicle_id
        WHERE v.depot_id = $1
          AND m.service_date BETWEEN $2 AND $3
    `;
  const params = [depotId, startDate, endDate];
  if (vehicleId) {
    query += ` AND m.vehicle_id = $4`;
    params.push(vehicleId);
  }
  query += ` ORDER BY m.service_date DESC`;
  const result = await pool.query(query, params);
  return result.rows;
}

export async function getRouteSummary(depotId, days = 30) {
  const query = `
        SELECT r.route_id, r.route_name, COUNT(s.schedule_id) as schedule_count
        FROM route r
        LEFT JOIN schedule s ON r.route_id = s.route_id
            AND s.schedule_date >= CURRENT_DATE - ($2 || ' days')::interval
        WHERE r.depot_id = $1
        GROUP BY r.route_id, r.route_name
        ORDER BY schedule_count DESC
    `;
  const result = await pool.query(query, [depotId, days]);
  return result.rows;
}

export async function generateScheduleReportPDF(
  schedules,
  startDate,
  endDate,
  depotName
) {
  const width = 300;
  const height = 300;
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

  const formatDate = (dateValue) => {
    if (!dateValue) return "";
    let dateStr;
    if (typeof dateValue === "object" && dateValue instanceof Date) {
      dateStr = dateValue.toISOString().split("T")[0];
    } else if (typeof dateValue === "string") {
      dateStr = dateValue;
    } else return "";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0].slice(-2)}`;
  };

  const total = schedules.length;
  const completed = schedules.filter((s) => s.status === "COMPLETED").length;
  const inProgress = schedules.filter((s) => s.status === "IN_PROGRESS").length;
  const cancelled = schedules.filter((s) => s.status === "CANCELLED").length;
  const scheduled = total - completed - inProgress - cancelled;

  // Pie chart
  const pieData = {
    labels: ["Completed", "In Progress", "Cancelled", "Scheduled"],
    datasets: [
      {
        data: [completed, inProgress, cancelled, scheduled],
        backgroundColor: ["#4CAF50", "#2196F3", "#F44336", "#FFC107"],
      },
    ],
  };

  // Bar chart (real or mock)
  const dailyCounts = new Map();
  schedules.forEach((s) => {
    let dateKey;
    if (s.schedule_date instanceof Date) {
      dateKey = s.schedule_date.toISOString().split("T")[0];
    } else if (typeof s.schedule_date === "string") {
      dateKey = s.schedule_date;
    } else {
      dateKey = String(s.schedule_date);
    }
    dailyCounts.set(dateKey, (dailyCounts.get(dateKey) || 0) + 1);
  });
  const days = Array.from(dailyCounts.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  let barData;
  if (days.length > 1) {
    barData = {
      labels: days.map((d) => formatDate(d[0])),
      datasets: [
        {
          label: "Trips",
          data: days.map((d) => d[1]),
          backgroundColor: "#4CAF50",
        },
      ],
    };
  } else {
    const mockLabels = [];
    const mockCounts = [];
    const today = new Date();
    for (let i = 4; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      mockLabels.push(formatDate(dateStr));
      const mockValue = [12, 18, 22, 16, 20][i];
      mockCounts.push(mockValue);
    }
    barData = {
      labels: mockLabels,
      datasets: [
        {
          label: "Trips (sample data)",
          data: mockCounts,
          backgroundColor: "#4CAF50",
        },
      ],
    };
  }

  const pieChartBuffer = await chartJSNodeCanvas.renderToBuffer({
    type: "pie",
    data: pieData,
  });
  const barChartBuffer = await chartJSNodeCanvas.renderToBuffer({
    type: "bar",
    data: barData,
  });

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Header
    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .text("LankaMetro Schedule Report", { align: "center" });
    doc.moveDown(0.5);
    doc
      .fontSize(11)
      .font("Helvetica")
      .text(`Depot: ${depotName}`, { align: "center" });
    doc.text(`Period: ${startDate} to ${endDate}`, { align: "center" });
    doc.text(`Generated: ${new Date().toLocaleString()}`, { align: "center" });
    doc.moveDown(1);

    if (!schedules || schedules.length === 0) {
      doc.fontSize(12).text("No schedules found for the selected period.", {
        align: "center",
      });
      doc.end();
      return;
    }

    // Summary cards
    const summaryY = doc.y;
    const cardWidth = (doc.page.width - 80) / 4;
    const summaryItems = [
      { label: "Total Schedules", value: total, bg: "#f5f5f5" },
      { label: "Completed", value: completed, bg: "#4CAF50" },
      { label: "In Progress", value: inProgress, bg: "#2196F3" },
      { label: "Cancelled", value: cancelled, bg: "#F44336" },
    ];
    let x = 40;
    summaryItems.forEach((item) => {
      doc
        .rect(x, summaryY, cardWidth - 10, 50)
        .fill(item.bg)
        .stroke();
      doc
        .fillColor("#333")
        .fontSize(10)
        .text(item.label, x + 5, summaryY + 5);
      doc.fontSize(16).text(item.value.toString(), x + 5, summaryY + 20);
      x += cardWidth;
    });
    doc.fillColor("black");
    doc.moveDown(3.5); // Space after cards

    // Charts side by side
    const chartAreaWidth = doc.page.width - 80;
    const halfWidth = chartAreaWidth / 2 - 20;

    // Pie chart (left)
    doc.fontSize(12).text("Schedule Status", 40, doc.y);
    const pieImage = doc.openImage(pieChartBuffer);
    doc.image(pieImage, 40, doc.y + 10, { width: halfWidth });

    // Bar chart (right)
    doc.fontSize(12).text("Trips per Day", 40 + halfWidth + 20, doc.y);
    const barImage = doc.openImage(barChartBuffer);
    doc.image(barImage, 40 + halfWidth + 20, doc.y + 10, { width: halfWidth });

    // Move below charts (add extra space)
    doc.y += halfWidth + 30; // already moves past the charts
    doc.moveDown(3.5); // Explicit extra space before table

    // Table
    const colWidths = [70, 55, 55, 110, 80, 85, 65];
    const headers = [
      "Date",
      "Depart",
      "Arrive",
      "Route",
      "Vehicle",
      "Driver",
      "Status",
    ];
    const startX = doc.page.margins.left;
    let startY = doc.y;
    const rowHeight = 25;

    const drawHeader = () => {
      let currentX = startX;
      doc
        .rect(
          startX,
          startY,
          colWidths.reduce((a, b) => a + b, 0),
          rowHeight
        )
        .fill("#e6e6e6");
      doc.font("Helvetica-Bold").fontSize(10).fillColor("black");
      headers.forEach((header, i) => {
        doc.text(header, currentX + 5, startY + 6, {
          width: colWidths[i] - 10,
          align: "left",
        });
        currentX += colWidths[i];
      });
      doc
        .rect(
          startX,
          startY,
          colWidths.reduce((a, b) => a + b, 0),
          rowHeight
        )
        .stroke();
      for (let i = 1; i < headers.length; i++) {
        const x = startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
        doc
          .moveTo(x, startY)
          .lineTo(x, startY + rowHeight)
          .stroke();
      }
      doc
        .moveTo(startX + colWidths.reduce((a, b) => a + b, 0), startY)
        .lineTo(
          startX + colWidths.reduce((a, b) => a + b, 0),
          startY + rowHeight
        )
        .stroke();
    };

    drawHeader();
    let currentY = startY + rowHeight;
    doc.font("Helvetica").fontSize(9).fillColor("black");
    for (const schedule of schedules) {
      const row = [
        formatDate(schedule.schedule_date),
        schedule.departure_time,
        schedule.arrival_time,
        schedule.route_name,
        schedule.plate_number,
        schedule.driver_name,
        schedule.status,
      ];
      let currentX = startX;
      for (let i = 0; i < row.length; i++) {
        let text = String(row[i]);
        if (i === 3 && text.length > 20) text = text.substring(0, 17) + "...";
        doc.text(text, currentX + 5, currentY + 5, {
          width: colWidths[i] - 10,
          align: "left",
        });
        currentX += colWidths[i];
      }
      doc
        .rect(
          startX,
          currentY,
          colWidths.reduce((a, b) => a + b, 0),
          rowHeight
        )
        .stroke();
      for (let i = 1; i < headers.length; i++) {
        const x = startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
        doc
          .moveTo(x, currentY)
          .lineTo(x, currentY + rowHeight)
          .stroke();
      }
      doc
        .moveTo(startX + colWidths.reduce((a, b) => a + b, 0), currentY)
        .lineTo(
          startX + colWidths.reduce((a, b) => a + b, 0),
          currentY + rowHeight
        )
        .stroke();
      currentY += rowHeight;
      if (currentY > doc.page.height - 70) {
        doc.addPage();
        startY = doc.page.margins.top;
        currentY = startY + rowHeight;
        drawHeader();
      }
    }

    doc.end();
  });
}

export async function generateMaintenanceReportPDF(
  records,
  startDate,
  endDate,
  depotName
) {
  const width = 300;
  const height = 300;
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

  const formatDate = (dateValue) => {
    if (!dateValue) return "";
    let dateStr;
    if (typeof dateValue === "object" && dateValue instanceof Date) {
      dateStr = dateValue.toISOString().split("T")[0];
    } else if (typeof dateValue === "string") {
      dateStr = dateValue;
    } else return "";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0].slice(-2)}`;
  };

  const total = records.length;
  const completed = records.filter((r) => r.status === "COMPLETED").length;
  const inProgress = records.filter((r) => r.status === "IN_PROGRESS").length;
  const scheduled = records.filter((r) => r.status === "SCHEDULED").length;
  const other = total - completed - inProgress - scheduled;

  // Pie chart data
  const pieData = {
    labels: ["Completed", "In Progress", "Scheduled", "Other"],
    datasets: [
      {
        data: [completed, inProgress, scheduled, other],
        backgroundColor: ["#4CAF50", "#2196F3", "#FFC107", "#9E9E9E"],
      },
    ],
  };

  // Bar chart – maintenance events per day
  const dailyCounts = new Map();
  records.forEach((r) => {
    let dateKey;
    if (r.service_date instanceof Date) {
      dateKey = r.service_date.toISOString().split("T")[0];
    } else if (typeof r.service_date === "string") {
      dateKey = r.service_date;
    } else {
      dateKey = String(r.service_date);
    }
    dailyCounts.set(dateKey, (dailyCounts.get(dateKey) || 0) + 1);
  });
  const days = Array.from(dailyCounts.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  );
  let barData;
  if (days.length > 1) {
    barData = {
      labels: days.map((d) => formatDate(d[0])),
      datasets: [
        {
          label: "Maintenance Events",
          data: days.map((d) => d[1]),
          backgroundColor: "#FF9800",
        },
      ],
    };
  } else {
    // Mock data for demonstration
    const mockLabels = [];
    const mockCounts = [];
    const today = new Date();
    for (let i = 4; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      mockLabels.push(formatDate(d.toISOString().split("T")[0]));
      mockCounts.push([2, 3, 5, 1, 4][i]);
    }
    barData = {
      labels: mockLabels,
      datasets: [
        {
          label: "Maintenance Events (sample)",
          data: mockCounts,
          backgroundColor: "#FF9800",
        },
      ],
    };
  }

  const pieChartBuffer = await chartJSNodeCanvas.renderToBuffer({
    type: "pie",
    data: pieData,
  });
  const barChartBuffer = await chartJSNodeCanvas.renderToBuffer({
    type: "bar",
    data: barData,
  });

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Header
    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .text("LankaMetro Maintenance Report", { align: "center" });
    doc.moveDown(0.5);
    doc
      .fontSize(11)
      .font("Helvetica")
      .text(`Depot: ${depotName}`, { align: "center" });
    doc.text(`Period: ${startDate} to ${endDate}`, { align: "center" });
    doc.text(`Generated: ${new Date().toLocaleString()}`, { align: "center" });
    doc.moveDown(1);

    if (!records || records.length === 0) {
      doc
        .fontSize(12)
        .text("No maintenance records found for the selected period.", {
          align: "center",
        });
      doc.end();
      return;
    }

    // Summary cards
    const summaryY = doc.y;
    const cardWidth = (doc.page.width - 80) / 4;
    const summaryItems = [
      { label: "Total Records", value: total, bg: "#f5f5f5" },
      { label: "Completed", value: completed, bg: "#4CAF50" },
      { label: "In Progress", value: inProgress, bg: "#2196F3" },
      { label: "Scheduled", value: scheduled, bg: "#FFC107" },
    ];
    let x = 40;
    summaryItems.forEach((item) => {
      doc
        .rect(x, summaryY, cardWidth - 10, 50)
        .fill(item.bg)
        .stroke();
      doc
        .fillColor("#333")
        .fontSize(10)
        .text(item.label, x + 5, summaryY + 5);
      doc.fontSize(16).text(item.value.toString(), x + 5, summaryY + 20);
      x += cardWidth;
    });
    doc.fillColor("black");
    doc.moveDown(3.5);

    // Charts side by side
    const chartAreaWidth = doc.page.width - 80;
    const halfWidth = chartAreaWidth / 2 - 20;

    doc.fontSize(12).text("Status Distribution", 40, doc.y);
    const pieImage = doc.openImage(pieChartBuffer);
    doc.image(pieImage, 40, doc.y + 10, { width: halfWidth });

    doc.fontSize(12).text("Maintenance per Day", 40 + halfWidth + 20, doc.y);
    const barImage = doc.openImage(barChartBuffer);
    doc.image(barImage, 40 + halfWidth + 20, doc.y + 10, { width: halfWidth });

    doc.y += halfWidth + 30;
    doc.moveDown(3.5);

    // Table
    const colWidths = [70, 90, 100, 100, 90];
    const headers = ["Date", "Vehicle", "Type", "Description", "Status"];
    const startX = doc.page.margins.left;
    let startY = doc.y;
    const rowHeight = 25;

    const drawHeader = () => {
      let currentX = startX;
      doc
        .rect(
          startX,
          startY,
          colWidths.reduce((a, b) => a + b, 0),
          rowHeight
        )
        .fill("#e6e6e6");
      doc.font("Helvetica-Bold").fontSize(10).fillColor("black");
      headers.forEach((header, i) => {
        doc.text(header, currentX + 5, startY + 6, {
          width: colWidths[i] - 10,
          align: "left",
        });
        currentX += colWidths[i];
      });
      doc
        .rect(
          startX,
          startY,
          colWidths.reduce((a, b) => a + b, 0),
          rowHeight
        )
        .stroke();
      for (let i = 1; i < headers.length; i++) {
        const x = startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
        doc
          .moveTo(x, startY)
          .lineTo(x, startY + rowHeight)
          .stroke();
      }
      doc
        .moveTo(startX + colWidths.reduce((a, b) => a + b, 0), startY)
        .lineTo(
          startX + colWidths.reduce((a, b) => a + b, 0),
          startY + rowHeight
        )
        .stroke();
    };

    drawHeader();
    let currentY = startY + rowHeight;
    doc.font("Helvetica").fontSize(9).fillColor("black");
    for (const record of records) {
      const row = [
        formatDate(record.service_date),
        record.plate_number || `Vehicle ${record.vehicle_id}`,
        record.type.replace(/_/g, " "),
        record.description?.substring(0, 30) || "—",
        record.status,
      ];
      let currentX = startX;
      for (let i = 0; i < row.length; i++) {
        let text = String(row[i]);
        if (i === 3 && text.length > 25) text = text.substring(0, 22) + "...";
        doc.text(text, currentX + 5, currentY + 5, {
          width: colWidths[i] - 10,
          align: "left",
        });
        currentX += colWidths[i];
      }
      doc
        .rect(
          startX,
          currentY,
          colWidths.reduce((a, b) => a + b, 0),
          rowHeight
        )
        .stroke();
      for (let i = 1; i < headers.length; i++) {
        const x = startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
        doc
          .moveTo(x, currentY)
          .lineTo(x, currentY + rowHeight)
          .stroke();
      }
      doc
        .moveTo(startX + colWidths.reduce((a, b) => a + b, 0), currentY)
        .lineTo(
          startX + colWidths.reduce((a, b) => a + b, 0),
          currentY + rowHeight
        )
        .stroke();
      currentY += rowHeight;
      if (currentY > doc.page.height - 70) {
        doc.addPage();
        startY = doc.page.margins.top;
        currentY = startY + rowHeight;
        drawHeader();
      }
    }

    doc.end();
  });
}

export default {
  getScheduleReport,
  getMaintenanceReport,
  getRouteSummary,
  generateScheduleReportPDF,
  generateMaintenanceReportPDF,
};
