import CrudManager from "../_components/CrudManager";

export default function AnnouncementsPage() {
  return (
    <CrudManager
      title="Push Announcement Manager"
      description="Send targeted announcements by ticket type, language, or zone."
      table="announcements"
      columns={[
        { key: "event_id", label: "Event ID" },
        { key: "title", label: "Title" },
        { key: "message", label: "Message", type: "textarea" },
        { key: "language", label: "Language" },
        {
          key: "targeting",
          label: "Targeting JSON",
          type: "json",
          placeholder: '{"ticket_type":"VIP","zone":"A"}',
        },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: ["draft", "scheduled", "sent"],
        },
        { key: "scheduled_at", label: "Scheduled At", type: "datetime" },
        { key: "sent_at", label: "Sent At", type: "datetime" },
      ]}
    />
  );
}
