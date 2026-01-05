import CrudManager from "../_components/CrudManager";

export default function AlertsAdminPage() {
  return (
    <CrudManager
      title="Safety Alerts"
      description="Create and manage live safety alerts."
      table="alerts"
      columns={[
        { key: "event_id", label: "Event ID" },
        {
          key: "alert_type",
          label: "Alert Type",
          type: "select",
          options: ["safety", "weather", "medical", "security"],
        },
        { key: "title", label: "Title" },
        { key: "message", label: "Message", type: "textarea" },
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
