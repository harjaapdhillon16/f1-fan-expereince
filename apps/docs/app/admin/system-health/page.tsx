import CrudManager from "../_components/CrudManager";

export default function SystemHealthPage() {
  return (
    <CrudManager
      title="System Health"
      description="Monitor uptime and service latency."
      table="system_health"
      columns={[
        { key: "service", label: "Service" },
        { key: "status", label: "Status" },
        { key: "latency_ms", label: "Latency (ms)", type: "number" },
        { key: "metadata", label: "Metadata", type: "json" },
      ]}
    />
  );
}
