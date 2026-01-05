import CrudManager from "../_components/CrudManager";

export default function MapLayersAdminPage() {
  return (
    <CrudManager
      title="Map Layers"
      description="Create and manage map layers for the venue."
      table="map_layers"
      columns={[
        { key: "event_id", label: "Event ID" },
        { key: "name", label: "Name" },
        { key: "layer_type", label: "Layer Type" },
        { key: "is_active", label: "Active", type: "checkbox" },
        { key: "sort_order", label: "Sort Order", type: "number" },
        { key: "data", label: "Layer Data", type: "json" },
      ]}
    />
  );
}
