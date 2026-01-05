import CrudManager from "../_components/CrudManager";

export default function EmergencyRequestsAdminPage() {
  return (
    <CrudManager
      title="Emergency Requests"
      description="Track incoming medical and security requests."
      table="emergency_requests"
      columns={[
        { key: "event_id", label: "Event ID" },
        { key: "user_id", label: "User ID" },
        {
          key: "request_type",
          label: "Type",
          type: "select",
          options: ["medical", "security", "lost", "other"],
        },
        { key: "message", label: "Message", type: "textarea" },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: ["open", "in_progress", "resolved"],
        },
      ]}
    />
  );
}
