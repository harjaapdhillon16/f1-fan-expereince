import CrudManager from "../../../admin/_components/CrudManager";

export default function RaceHighlightsAdminPage() {
  return (
    <CrudManager
      title="Race Highlights"
      description="Publish highlight clips and summaries."
      table="race_highlights"
      columns={[
        { key: "event_id", label: "Event ID" },
        { key: "title", label: "Title" },
        { key: "summary", label: "Summary", type: "textarea" },
        { key: "media_url", label: "Media URL" },
      ]}
    />
  );
}
