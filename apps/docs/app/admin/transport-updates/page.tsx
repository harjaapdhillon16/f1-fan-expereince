import CrudManager from "../_components/CrudManager";

export default function TransportUpdatesAdminPage() {
  return (
    <CrudManager
      title="Transport Updates"
      description="Publish live shuttle, metro, and traffic updates."
      table="transport_updates"
      columns={[
        { key: "event_id", label: "Event ID" },
        { key: "route_name", label: "Route Name" },
        { key: "status", label: "Status" },
        { key: "detail", label: "Detail", type: "textarea" },
        {
          key: "severity",
          label: "Severity",
          type: "select",
          options: ["info", "warning", "critical"],
        },
        { key: "start_at", label: "Start At", type: "datetime" },
        { key: "end_at", label: "End At", type: "datetime" },
      ]}
    />
  );
}
