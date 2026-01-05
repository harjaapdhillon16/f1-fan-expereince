import Link from "next/link";

export default function FanEntry() {
  return (
    <div className="min-h-screen bg-ink text-ice">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center px-6">
        <div className="w-full space-y-6 rounded-3xl border border-ice/15 bg-carbon/70 p-10">
          <p className="text-xs uppercase tracking-[0.3em] text-ice/60">
            F1 Fan Experience
          </p>
          <h1 className="text-4xl font-semibold uppercase tracking-[0.1em] text-ice">
            Fan App & Ops Console
          </h1>
          <p className="text-sm text-ice/70">
            Launch the fan-facing PWA or jump to the admin operations console.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              className="rounded-full bg-redline px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-ice"
              href="/fan/countdown"
            >
              Enter Fan App
            </Link>
            <a
              className="rounded-full border border-ice/30 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-ice/80"
              href="http://localhost:3001/admin"
            >
              Open Admin Ops
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
