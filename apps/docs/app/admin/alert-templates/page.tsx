import CrudManager from "../_components/CrudManager";

export default function AlertTemplatesPage() {
  return (
    <CrudManager
      title="Alert Templates"
      description="Pre-write alert templates for rapid deployment."
      table="alert_templates"
      columns={[
        { key: "title", label: "Title" },
        { key: "message", label: "Message", type: "textarea" },
        {
          key: "alert_type",
          label: "Alert Type",
          type: "select",
          options: ["safety", "weather", "medical", "security"],
        },
        {
          key: "severity",
          label: "Severity",
          type: "select",
          options: ["info", "warning", "critical"],
        },
      ]}
    />
  );
}
