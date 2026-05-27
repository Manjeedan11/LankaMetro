import pool from "../db.js";
import PDFDocument from "pdfkit";

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

export function generateScheduleReportPDF(
  schedules,
  startDate,
  endDate,
  depotName
) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Title
    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .text("SRMSS Schedule Report", { align: "center" });
    doc.moveDown(0.5);
    doc
      .fontSize(11)
      .font("Helvetica")
      .text(`Depot: ${depotName}`, { align: "center" });
    doc.text(`Period: ${startDate} to ${endDate}`, { align: "center" });
    doc.moveDown(1.5);

    // Column widths (optimised for A4 with 40pt margins)
    // Total = 70+55+55+110+80+85+60 = 515 (perfect)
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

    // Helper to format date YYYY-MM-DD → DD/MM/YY
    const formatDate = (dateValue) => {
      if (!dateValue) return "";
      let dateStr;
      if (typeof dateValue === "object" && dateValue instanceof Date) {
        dateStr = dateValue.toISOString().split("T")[0];
      } else if (typeof dateValue === "string") {
        dateStr = dateValue;
      } else {
        return "";
      }
      const parts = dateStr.split("-");
      if (parts.length !== 3) return dateStr;
      return `${parts[2]}/${parts[1]}/${parts[0].slice(-2)}`;
    };

    // Draw header background and borders
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
      .lineTo(startX + colWidths.reduce((a, b) => a + b, 0), startY + rowHeight)
      .stroke();

    // Data rows
    let currentY = startY + rowHeight;
    doc.font("Helvetica").fontSize(9).fillColor("black");
    schedules.forEach((schedule, index) => {
      const row = [
        formatDate(schedule.schedule_date),
        schedule.departure_time,
        schedule.arrival_time,
        schedule.route_name,
        schedule.plate_number,
        schedule.driver_name,
        schedule.status,
      ];
      currentX = startX;
      for (let i = 0; i < row.length; i++) {
        let text = String(row[i]);
        if (i === 3 && text.length > 20) text = text.substring(0, 17) + "..."; // truncate long route
        doc.text(text, currentX + 5, currentY + 5, {
          width: colWidths[i] - 10,
          align: "left",
        });
        currentX += colWidths[i];
      }
      // Draw row borders
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
        currentY = doc.page.margins.top;
        startY = currentY;
        // Redraw header on new page
        doc
          .rect(
            startX,
            startY,
            colWidths.reduce((a, b) => a + b, 0),
            rowHeight
          )
          .fill("#e6e6e6");
        doc.font("Helvetica-Bold").fontSize(10).fillColor("black");
        let tempX = startX;
        headers.forEach((header, i) => {
          doc.text(header, tempX + 5, startY + 6, {
            width: colWidths[i] - 10,
            align: "left",
          });
          tempX += colWidths[i];
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
        currentY = startY + rowHeight;
      }
    });

    doc.end();
  });
}
export default {
  getScheduleReport,
  getMaintenanceReport,
  getRouteSummary,
  generateScheduleReportPDF,
};
