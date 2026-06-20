import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const Api = createApi({
  reducerPath: "Api",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://lankametro-backend.onrender.com/api/",
    prepareHeaders: (headers, { getState }) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    "User",
    "Depot",
    "Vehicle",
    "Route",
    "Stop",
    "Schedule",
    "Driver",
    "Maintenance",
    "Notification",
    "Report",
  ],
  endpoints: (builder) => ({
    // ========== AUTH ==========
    login: builder.mutation({
      query: (credentials) => ({
        url: `auth/login`,
        method: "POST",
        body: credentials,
      }),
    }),

    // ========== USERS ==========
    getUsers: builder.query({
      query: () => `users`,
      providesTags: ["User"],
    }),
    getUserById: builder.query({
      query: (id) => `users/${id}`,
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),
    createUser: builder.mutation({
      query: (userData) => ({
        url: `users`,
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["User"],
    }),
    updateUser: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `users/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "User", id }],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),

    // ========== DEPOTS ==========
    getDepots: builder.query({
      query: () => `depots`,
      providesTags: ["Depot"],
    }),
    getDepotById: builder.query({
      query: (id) => `depots/${id}`,
      providesTags: (result, error, id) => [{ type: "Depot", id }],
    }),
    createDepot: builder.mutation({
      query: (depotData) => ({
        url: `depots`,
        method: "POST",
        body: depotData,
      }),
      invalidatesTags: ["Depot"],
    }),
    updateDepot: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `depots/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Depot", id }],
    }),
    deleteDepot: builder.mutation({
      query: (id) => ({
        url: `depots/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Depot"],
    }),

    // ========== VEHICLES ==========
    getVehicles: builder.query({
      query: () => `vehicles`,
      providesTags: ["Vehicle"],
    }),
    getVehicleById: builder.query({
      query: (id) => `vehicles/${id}`,
      providesTags: (result, error, id) => [{ type: "Vehicle", id }],
    }),
    createVehicle: builder.mutation({
      query: (vehicleData) => ({
        url: `vehicles`,
        method: "POST",
        body: vehicleData,
      }),
      invalidatesTags: ["Vehicle"],
    }),
    updateVehicle: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `vehicles/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Vehicle", id }],
    }),
    deleteVehicle: builder.mutation({
      query: (id) => ({
        url: `vehicles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Vehicle"],
    }),
    getAvailableVehicles: builder.query({
      query: ({ date, start, end }) =>
        `vehicles/available?date=${date}&start=${start}&end=${end}`,
      providesTags: ["Vehicle"],
    }),
    requestSuddenTrip: builder.mutation({
      query: (id) => ({
        url: `vehicles/${id}/request-sudden-trip`,
        method: "PATCH",
      }),
      invalidatesTags: ["Vehicle", "Notification"],
    }),

    // ========== ROUTES ==========
    getRoutes: builder.query({
      query: () => `route`,
      providesTags: ["Route"],
    }),
    getRouteById: builder.query({
      query: (id) => `route/${id}`,
      providesTags: (result, error, id) => [{ type: "Route", id }],
    }),
    createRoute: builder.mutation({
      query: (routeData) => ({
        url: `route`,
        method: "POST",
        body: routeData,
      }),
      invalidatesTags: ["Route"],
    }),
    updateRoute: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `route/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Route", id }],
    }),
    deleteRoute: builder.mutation({
      query: (id) => ({
        url: `route/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Route"],
    }),
    getRouteStops: builder.query({
      query: (routeId) => `routes/${routeId}/stops`,
      providesTags: ["Stop"],
    }),
    addStopToRoute: builder.mutation({
      query: ({ routeId, stopId, stopOrder }) => ({
        url: `routes/${routeId}/stops`,
        method: "POST",
        body: { stop_id: stopId, stop_order: stopOrder },
      }),
      invalidatesTags: ["Stop"],
    }),
    removeStopFromRoute: builder.mutation({
      query: ({ routeId, stopOrder }) => ({
        url: `routes/${routeId}/stops`,
        method: "DELETE",
        body: { stop_order: stopOrder },
      }),
      invalidatesTags: ["Stop"],
    }),

    // ========== STOPS ==========
    getStops: builder.query({
      query: () => `stops`,
      providesTags: ["Stop"],
    }),
    getStopById: builder.query({
      query: (id) => `stops/${id}`,
      providesTags: (result, error, id) => [{ type: "Stop", id }],
    }),
    createStop: builder.mutation({
      query: (stopData) => ({
        url: `stops`,
        method: "POST",
        body: stopData,
      }),
      invalidatesTags: ["Stop"],
    }),
    updateStop: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `stops/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Stop", id }],
    }),
    deleteStop: builder.mutation({
      query: (id) => ({
        url: `stops/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Stop"],
    }),

    // ========== SCHEDULES ==========
    getSchedules: builder.query({
      query: (date) => `schedules${date ? `?date=${date}` : ""}`,
      providesTags: ["Schedule"],
    }),
    getScheduleById: builder.query({
      query: (id) => `schedules/${id}`,
      providesTags: (result, error, id) => [{ type: "Schedule", id }],
    }),
    createSchedule: builder.mutation({
      query: (scheduleData) => ({
        url: `schedules`,
        method: "POST",
        body: scheduleData,
      }),
      invalidatesTags: ["Schedule", "Driver", "Vehicle"],
    }),
    updateSchedule: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `schedules/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Schedule", id }],
    }),
    updateScheduleStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `schedules/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Schedule", id },
        "Driver",
      ],
    }),

    deleteSchedule: builder.mutation({
      query: (id) => ({
        url: `schedules/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Schedule"],
    }),
    getMySchedules: builder.query({
      query: () => `schedules/my`,
      providesTags: ["Schedule"],
    }),
    getMyHistory: builder.query({
      query: () => `schedules/history`,
      providesTags: ["Schedule"],
    }),
    updateReturnTripStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `return-trips/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Schedule"],
    }),

    // ========== DRIVERS ==========
    getDrivers: builder.query({
      query: () => `drivers`,
      providesTags: ["Driver"],
    }),
    getDriverById: builder.query({
      query: (id) => `drivers/${id}`,
      providesTags: (result, error, id) => [{ type: "Driver", id }],
    }),
    updateDriver: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `drivers/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Driver", id }],
    }),
    updateDriverAvailability: builder.mutation({
      query: ({ id, availability }) => ({
        url: `drivers/${id}/availability`,
        method: "PATCH",
        body: { availability },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Driver", id }],
    }),

    getAvailableDrivers: builder.query({
      query: ({ date, start, end }) =>
        `drivers/available?date=${date}&start=${start}&end=${end}`,
      providesTags: ["Driver"],
    }),
    requestSuddenTripForDriver: builder.mutation({
      query: (id) => ({
        url: `drivers/${id}/request-sudden-trip`,
        method: "PATCH",
      }),
      invalidatesTags: ["Driver", "Notification"],
    }),

    // ========== MAINTENANCE ==========
    getMaintenanceRecords: builder.query({
      query: ({ vehicleId, status } = {}) => {
        let url = `maintenance`;
        const params = new URLSearchParams();
        if (vehicleId) params.append("vehicleId", vehicleId);
        if (status) params.append("status", status);
        if (params.toString()) url += `?${params.toString()}`;
        return url;
      },
      providesTags: ["Maintenance"],
    }),
    getMaintenanceById: builder.query({
      query: (id) => `maintenance/${id}`,
      providesTags: (result, error, id) => [{ type: "Maintenance", id }],
    }),
    createMaintenance: builder.mutation({
      query: (maintenanceData) => ({
        url: `maintenance`,
        method: "POST",
        body: maintenanceData,
      }),
      invalidatesTags: ["Maintenance", "Vehicle"],
    }),
    updateMaintenance: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `maintenance/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Maintenance", id }],
    }),
    completeMaintenance: builder.mutation({
      query: (id) => ({
        url: `maintenance/${id}/complete`,
        method: "PATCH",
      }),
      invalidatesTags: ["Maintenance", "Vehicle"],
    }),
    deleteMaintenance: builder.mutation({
      query: (id) => ({
        url: `maintenance/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Maintenance"],
    }),

    // ========== NOTIFICATIONS ==========
    getNotifications: builder.query({
      query: () => `notifications`,
      providesTags: ["Notification"],
    }),
    deleteNotification: builder.mutation({
      query: (id) => ({
        url: `notifications/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notification"],
    }),

    // ========== REPORTS ==========
    getScheduleReport: builder.query({
      query: ({ startDate, endDate }) =>
        `reports/schedules?startDate=${startDate}&endDate=${endDate}`,
      providesTags: ["Report"],
    }),
    getMaintenanceReport: builder.query({
      query: ({ startDate, endDate, vehicleId }) => {
        let url = `reports/maintenance?startDate=${startDate}&endDate=${endDate}`;
        if (vehicleId) url += `&vehicleId=${vehicleId}`;
        return url;
      },
      providesTags: ["Report"],
    }),
    getRouteSummary: builder.query({
      query: (days = 30) => `reports/routes?days=${days}`,
      providesTags: ["Report"],
    }),

    exportScheduleReportPDF: builder.query({
      query: ({ startDate, endDate }) => ({
        url: `reports/schedules/pdf?startDate=${startDate}&endDate=${endDate}`,
        method: "GET",
        responseHandler: (response) => response.blob(),
      }),
      keepUnusedDataFor: 0,
    }),

    exportMaintenanceReportPDF: builder.query({
      query: ({ startDate, endDate, vehicleId }) => {
        let url = `reports/maintenance/pdf?startDate=${startDate}&endDate=${endDate}`;
        if (vehicleId && vehicleId !== "all") url += `&vehicleId=${vehicleId}`;
        return {
          url,
          method: "GET",
          responseHandler: (response) => response.blob(),
        };
      },
      keepUnusedDataFor: 0,
    }),

    // ========== SYSTEM LOGS ==========
    getSystemLogs: builder.query({
      query: ({ page = 1, limit = 50, startDate, endDate, userId, action }) => {
        let url = `system-logs?page=${page}&limit=${limit}`;
        if (startDate) url += `&startDate=${startDate}`;
        if (endDate) url += `&endDate=${endDate}`;
        if (userId) url += `&userId=${userId}`;
        if (action) url += `&action=${action}`;
        return url;
      },
      providesTags: ["SystemLog"],
    }),

    // ========== SYSTEM SETTINGS ==========
    getSystemSettings: builder.query({
      query: () => `system-settings`,
      providesTags: ["SystemSetting"],
    }),
    updateSystemSetting: builder.mutation({
      query: ({ key, value }) => ({
        url: `system-settings/${key}`,
        method: "PATCH",
        body: { value },
      }),
      invalidatesTags: ["SystemSetting"],
    }),
  }),
});

export const {
  useLoginMutation,

  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,

  useGetDepotsQuery,
  useGetDepotByIdQuery,
  useCreateDepotMutation,
  useUpdateDepotMutation,
  useDeleteDepotMutation,

  useGetVehiclesQuery,
  useGetVehicleByIdQuery,
  useCreateVehicleMutation,
  useUpdateVehicleMutation,
  useDeleteVehicleMutation,
  useGetAvailableVehiclesQuery,
  useRequestSuddenTripMutation,

  useGetRoutesQuery,
  useGetRouteByIdQuery,
  useCreateRouteMutation,
  useUpdateRouteMutation,
  useDeleteRouteMutation,
  useGetRouteStopsQuery,
  useAddStopToRouteMutation,
  useRemoveStopFromRouteMutation,

  useGetStopsQuery,
  useGetStopByIdQuery,
  useCreateStopMutation,
  useUpdateStopMutation,
  useDeleteStopMutation,

  useGetSchedulesQuery,
  useGetScheduleByIdQuery,
  useCreateScheduleMutation,
  useUpdateScheduleMutation,
  useDeleteScheduleMutation,
  useUpdateScheduleStatusMutation,
  useGetMySchedulesQuery,
  useGetMyHistoryQuery,
  useUpdateReturnTripStatusMutation,

  useGetDriversQuery,
  useGetDriverByIdQuery,
  useUpdateDriverMutation,
  useUpdateDriverAvailabilityMutation,
  useGetAvailableDriversQuery,
  useRequestSuddenTripForDriverMutation,

  useGetMaintenanceRecordsQuery,
  useGetMaintenanceByIdQuery,
  useCreateMaintenanceMutation,
  useUpdateMaintenanceMutation,
  useCompleteMaintenanceMutation,
  useDeleteMaintenanceMutation,

  useGetNotificationsQuery,
  useDeleteNotificationMutation,

  useGetScheduleReportQuery,
  useGetMaintenanceReportQuery,
  useGetRouteSummaryQuery,
  useExportScheduleReportPDFQuery,
  useExportMaintenanceReportPDFQuery,

  useGetSystemLogsQuery,
  useGetSystemSettingsQuery,
  useUpdateSystemSettingMutation,
} = Api;
