import CrudManager from "../_components/CrudManager";

export default function MapPointsAdminPage() {
  return (
    <CrudManager
      title="Map Points"
      description="Add points of interest for wayfinding."
      table="map_points"
      columns={[
        { key: "layer_id", label: "Layer ID" },
        { key: "name", label: "Name" },
        { key: "point_type", label: "Point Type" },
        { key: "latitude", label: "Latitude", type: "number" },
        { key: "longitude", label: "Longitude", type: "number" },
        { key: "metadata", label: "Metadata", type: "json" },
      ]}
    />
  );
}
