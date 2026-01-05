import CrudManager from "../_components/CrudManager";

export default function TransportRoutesAdminPage() {
  return (
    <CrudManager
      title="Transport Routes"
      description="Define transport planner routes and instructions."
      table="transport_routes"
      columns={[
        { key: "event_id", label: "Event ID" },
        {
          key: "mode",
          label: "Mode",
          type: "select",
          options: ["shuttle", "metro", "parking", "rideshare"],
        },
        { key: "zone", label: "Zone" },
        { key: "instructions", label: "Instructions", type: "textarea" },
        { key: "is_active", label: "Active", type: "checkbox" },
      ]}
    />
  );
}
