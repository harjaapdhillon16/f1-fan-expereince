import CrudManager from "../_components/CrudManager";

export default function WayfindingRequestsAdminPage() {
  return (
    <CrudManager
      title="Wayfinding Requests"
      description="Monitor fan location requests and routing status."
      table="wayfinding_requests"
      columns={[
        { key: "event_id", label: "Event ID" },
        { key: "user_id", label: "User ID" },
        { key: "start_lat", label: "Start Lat", type: "number" },
        { key: "start_lng", label: "Start Lng", type: "number" },
        { key: "destination_point_id", label: "Destination ID" },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: ["open", "resolved"],
        },
      ]}
    />
  );
}
