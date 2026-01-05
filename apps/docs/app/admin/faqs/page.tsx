import CrudManager from "../_components/CrudManager";

export default function FaqAdminPage() {
  return (
    <div className="space-y-10">
      <CrudManager
        title="FAQ Categories"
        description="Create and organize FAQ categories by event."
        table="faq_categories"
        columns={[
          { key: "event_id", label: "Event ID" },
          { key: "name", label: "Name" },
          { key: "sort_order", label: "Sort Order", type: "number" },
        ]}
      />

      <CrudManager
        title="FAQ Entries"
        description="Publish and update fan-facing answers in real time."
        table="faqs"
        columns={[
          { key: "event_id", label: "Event ID" },
          { key: "category_id", label: "Category ID" },
          { key: "question", label: "Question", type: "textarea" },
          { key: "answer", label: "Answer", type: "textarea" },
          { key: "language", label: "Language" },
          { key: "is_active", label: "Active", type: "checkbox" },
          { key: "priority", label: "Priority", type: "number" },
          { key: "view_count", label: "View Count", type: "number" },
        ]}
      />
    </div>
  );
}
