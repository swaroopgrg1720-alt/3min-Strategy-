import { CryptoCheckout } from "@/components/checkout/CryptoCheckout";
import { requireUser } from "@/lib/auth";
import { isPlanId } from "@/lib/config/pricing";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const user = await requireUser();
  const { plan } = await searchParams;
  return (
    <>
      <h1 className="mb-1 text-2xl font-bold">Renew / Buy</h1>
      <p className="mb-6 text-sm text-muted">Pick how long you want, pay with crypto, and your license updates here automatically.</p>
      <CryptoCheckout dashboard accountEmail={user.email ?? ""} initialPlan={isPlanId(plan) ? plan : "monthly"} />
    </>
  );
}
