import Link from "next/link";

export default function AdminEntry() {
  return (
    <div className="min-h-screen bg-opsink text-opsfog">
      <div className="mx-auto flex min-h-screen max-w-4xl items-center px-6">
        <div className="w-full space-y-6 admin-card p-10">
          <p className="admin-kicker">
            F1 Fan Experience
          </p>
          <h1 className="admin-title-lg">
            Admin Ops Console
          </h1>
          <p className="admin-description">
            Launch the full admin dashboard with dedicated pages for each
            operational feature.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              className="admin-button-primary px-6 py-3"
              href="/admin"
            >
              Enter Ops
            </Link>
            <Link
              className="admin-button-secondary px-6 py-3"
              href="/login"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
