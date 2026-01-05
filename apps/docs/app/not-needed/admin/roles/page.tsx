import CrudManager from "../../../admin/_components/CrudManager";

export default function RolesAdminPage() {
  return (
    <div className="space-y-10">
      <CrudManager
        title="Roles"
        description="Define admin, ops, and security roles."
        table="roles"
        columns={[
          { key: "name", label: "Name" },
          { key: "description", label: "Description", type: "textarea" },
        ]}
      />

      <CrudManager
        title="User Role Assignments"
        description="Assign roles to users per event."
        table="user_roles"
        columns={[
          { key: "user_id", label: "User ID" },
          { key: "role_id", label: "Role ID" },
          { key: "event_id", label: "Event ID" },
        ]}
      />
    </div>
  );
}
