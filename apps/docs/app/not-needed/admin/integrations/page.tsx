import CrudManager from "../../../admin/_components/CrudManager";

export default function IntegrationsAdminPage() {
  return (
    <CrudManager
      title="Integration Connections"
      description="Track ticketing, transport, and maps integrations."
      table="integration_connections"
      columns={[
        { key: "provider", label: "Provider" },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: ["inactive", "active", "error"],
        },
        { key: "config", label: "Config JSON", type: "json" },
        { key: "last_sync_at", label: "Last Sync", type: "datetime" },
      ]}
    />
  );
}
