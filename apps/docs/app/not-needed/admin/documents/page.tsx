import CrudManager from "../../../admin/_components/CrudManager";

export default function DocumentsAdminPage() {
  return (
    <CrudManager
      title="Documents"
      description="Upload maps, PDFs, and schedule updates."
      table="documents"
      columns={[
        { key: "event_id", label: "Event ID" },
        { key: "title", label: "Title" },
        { key: "file_url", label: "File URL" },
        { key: "file_type", label: "File Type" },
      ]}
    />
  );
}
