import CrudManager from "../_components/CrudManager";

export default function TicketTypesAdminPage() {
  return (
    <CrudManager
      title="Ticket Types"
      description="Configure ticketing tiers and access levels."
      table="ticket_types"
      columns={[
        { key: "event_id", label: "Event ID" },
        { key: "name", label: "Name" },
        { key: "description", label: "Description", type: "textarea" },
      ]}
    />
  );
}
