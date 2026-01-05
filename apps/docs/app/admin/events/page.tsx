import CrudManager from "../_components/CrudManager";

export default function EventsAdminPage() {
  return (
    <CrudManager
      title="Events"
      description="Create and manage race weekend events."
      table="events"
      columns={[
        { key: "venue_id", label: "Venue ID" },
        { key: "name", label: "Name" },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: ["draft", "published", "live", "completed"],
        },
        { key: "start_at", label: "Start At", type: "datetime" },
        { key: "end_at", label: "End At", type: "datetime" },
      ]}
    />
  );
}
