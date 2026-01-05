import CrudManager from "../_components/CrudManager";

export default function TicketsAdminPage() {
  return (
    <CrudManager
      title="Tickets"
      description="Issue and manage tickets linked to fans."
      table="tickets"
      columns={[
        { key: "event_id", label: "Event ID" },
        { key: "user_id", label: "User ID" },
        { key: "ticket_type_id", label: "Ticket Type ID" },
        { key: "seat", label: "Seat" },
        { key: "qr_payload", label: "QR Payload", type: "textarea" },
        { key: "wallet_pass_url", label: "Wallet URL" },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: ["active", "used", "revoked"],
        },
      ]}
    />
  );
}
