import CrudManager from "../../../admin/_components/CrudManager";

export default function FeedbackReportsPage() {
  return (
    <CrudManager
      title="Feedback Reports"
      description="Generate and store post-race feedback summaries."
      table="feedback_reports"
      columns={[
        { key: "survey_id", label: "Survey ID" },
        { key: "summary", label: "Summary", type: "textarea" },
        { key: "report_url", label: "Report URL" },
      ]}
    />
  );
}
