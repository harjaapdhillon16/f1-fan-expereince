import CrudManager from "../_components/CrudManager";

export default function SessionsAdminPage() {
  return (
    <CrudManager
      title="Sessions"
      description="Publish practice, qualifying, and race sessions."
      table="sessions"
      columns={[
        { key: "event_id", label: "Event ID" },
        { key: "name", label: "Name" },
        {
          key: "session_type",
          label: "Type",
          type: "select",
          options: ["practice", "qualifying", "race", "support"],
        },
        { key: "start_at", label: "Start At", type: "datetime" },
        { key: "end_at", label: "End At", type: "datetime" },
        { key: "broadcast_channel", label: "Broadcast" },
        { key: "is_featured", label: "Featured", type: "checkbox" },
      ]}
    />
  );
}
