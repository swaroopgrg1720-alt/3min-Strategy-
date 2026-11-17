import { Empty } from "@/components/dashboard/DashboardShell";
import { myLicenses } from "@/lib/db/customer";

export const dynamic = "force-dynamic";

export default async function Page() {
  const ok = (await myLicenses()).some((l) => l.state === "active");
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Download</h1>
      {ok ? (
        <div className="card">
          <h2 className="text-lg font-semibold">3MIN SCALP (EX5)</h2>
          <p className="mt-2 text-sm text-muted">Your download link is generated securely and expires within a minute. Follow the installation guide after downloading.</p>
          <a href="/api/download" className="btn btn-primary mt-5">Download EA</a>
        </div>
      ) : (
        <Empty title="No active license" text="Downloads are available with an active license." />
      )}
    </>
  );
}
