import CrudManager from "../../../admin/_components/CrudManager";

export default function CampaignsAdminPage() {
  return (
    <CrudManager
      title="Sponsor Campaigns"
      description="Launch and manage sponsor promotions."
      table="sponsor_campaigns"
      columns={[
        { key: "sponsor_id", label: "Sponsor ID" },
        { key: "event_id", label: "Event ID" },
        { key: "title", label: "Title" },
        { key: "cta_text", label: "CTA Text" },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: ["draft", "live", "paused", "completed"],
        },
        { key: "start_at", label: "Start At", type: "datetime" },
        { key: "end_at", label: "End At", type: "datetime" },
      ]}
    />
  );
}
