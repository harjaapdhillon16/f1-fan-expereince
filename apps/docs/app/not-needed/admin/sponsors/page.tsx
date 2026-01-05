import CrudManager from "../../../admin/_components/CrudManager";

export default function SponsorsAdminPage() {
  return (
    <CrudManager
      title="Sponsors"
      description="Manage sponsor profiles and tiers."
      table="sponsors"
      columns={[
        { key: "name", label: "Name" },
        { key: "tier", label: "Tier" },
        { key: "logo_url", label: "Logo URL" },
      ]}
    />
  );
}
