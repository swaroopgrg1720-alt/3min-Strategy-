import Link from "next/link";
import { LicenseCards } from "@/components/dashboard/LicenseCards";
import { PageHeader, type LicenseView } from "@/components/dashboard/ui";
import { myLicenses } from "@/lib/db/customer";

export const dynamic = "force-dynamic";

export default async function Page() {
  const all = await myLicenses();
  const views: LicenseView[] = all.map((l) => ({ id: l.id, license_ref: l.license_ref, plan: l.plan, start_date: l.start_date, expiration_date: l.expiration_date, mt5_account: l.mt5_account, state: l.state }));
  return (
    <>
      <PageHeader title="My License" text="Open a license to see its key, countdown and payment history.">
        <Link href="/dashboard/renew" className="inline-flex min-h-[46px] items-center rounded-full border border-line px-5 text-sm font-semibold text-ink active:bg-forest/40">Renew / Buy</Link>
      </PageHeader>
      <LicenseCards licenses={views} />
    </>
  );
}
