import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { Badge, EmptyState, FlashBanner, PageHead, field, fmtDate, relDays, smallBtn, smallPrimary, type AdminSearch } from "@/components/admin/ui";
import { deleteProductAction, publishProductAction, setCurrentProductAction } from "../actions";

export const metadata: Metadata = { title: "EA downloads | Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const BACK = "/admin/downloads";
const size = (n?: number) => (n ? (n > 1_048_576 ? `${(n / 1_048_576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`) : "");

export default async function Page({ searchParams }: { searchParams: Promise<AdminSearch> }) {
  const sp = await searchParams;
  await requireAdmin();
  const db = supabaseAdmin();
  const [products, dls, files] = await Promise.all([
    db.from("products").select("*").order("created_at", { ascending: false }).limit(50),
    db.from("downloads").select("product_id").limit(10000),
    db.storage.from("ea-files").list("", { limit: 100, sortBy: { column: "created_at", order: "desc" } }),
  ]);
  const list = products.data ?? [];
  const current = list.find((p) => p.is_current);
  const counts = new Map<string, number>();
  (dls.data ?? []).forEach((d) => d.product_id && counts.set(d.product_id, (counts.get(d.product_id) ?? 0) + 1));
  const stored = (files.data ?? []).filter((f) => f.id && !f.name.startsWith("."));
  const storageError = files.error?.message;

  return (
    <>
      <PageHead title="EA downloads" text="Choose which EA file customers with an active license can download." />
      <FlashBanner ok={sp.ok} info={sp.info} error={sp.error ?? products.error?.message} />

      <section className="mb-6 rounded-3xl border border-accent/30 bg-forest/20 p-5" aria-label="Current EA">
        <p className="text-sm text-muted">Customers download</p>
        {current ? (
          <>
            <p className="mt-1 font-display text-2xl font-bold">Version {current.version}</p>
            <p className="mt-1 break-all font-mono text-xs text-muted">{current.storage_path}</p>
            <a href={`/admin/downloads/get?id=${current.id}`} className={`${smallBtn} mt-4`}>Test download</a>
          </>
        ) : <p className="mt-1 font-semibold text-amber-300">Nothing is published yet. Customers cannot download until you publish a file below.</p>}
      </section>

      <section className="rounded-3xl border border-line bg-bg2 p-5" aria-label="Publish a new version">
        <h2 className="text-lg font-semibold">Publish a new version</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted">
          <li>Upload the .ex5 file in Supabase → Storage → <code>ea-files</code> (a private bucket).</li>
          <li>Come back here, pick the file, enter the version, and publish.</li>
        </ol>
        <form action={publishProductAction} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="back" value={BACK} />
          <label className="text-sm text-muted sm:col-span-2">File in storage
            {stored.length > 0 ? (
              <select name="path" required className={`${field} mt-1`}>
                {stored.map((f) => <option key={f.name} value={f.name}>{f.name} {size((f.metadata as { size?: number } | null)?.size)}</option>)}
              </select>
            ) : <input name="path" required placeholder="3MIN_SCALP_v1.0.0.ex5" className={`${field} mt-1`} />}
          </label>
          {stored.length === 0 && <p className="text-xs text-amber-300 sm:col-span-2">{storageError ? `Could not read storage: ${storageError}` : "No files found in the ea-files bucket yet. Upload one in Supabase, or type its exact name above."}</p>}
          <label className="text-sm text-muted">Version<input name="version" required placeholder="1.0.0" className={`${field} mt-1`} /></label>
          <label className="text-sm text-muted">Release notes (optional)<input name="notes" className={`${field} mt-1`} /></label>
          <SubmitButton className="btn btn-primary sm:col-span-2">Publish and make current</SubmitButton>
        </form>
      </section>

      <h2 className="mb-3 mt-8 text-lg font-semibold">All versions</h2>
      {list.length === 0 ? <EmptyState title="No versions yet" text="Published versions are listed here, and you can switch back to an older one at any time." /> : (
        <ul className="space-y-3">
          {list.map((p) => (
            <li key={p.id} className="rounded-3xl border border-line bg-bg2 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-display text-lg font-semibold">Version {p.version}</p>
                {p.is_current ? <Badge tone="good">Current</Badge> : <Badge>Older</Badge>}
              </div>
              <p className="mt-1 break-all font-mono text-xs text-muted">{p.storage_path}</p>
              {p.release_notes && <p className="mt-2 text-sm text-muted">{p.release_notes}</p>}
              <p className="mt-2 text-xs text-muted">Published {fmtDate(p.created_at)} ({relDays(p.created_at)}) · {counts.get(p.id) ?? 0} download{(counts.get(p.id) ?? 0) === 1 ? "" : "s"}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {!p.is_current && (
                  <form action={setCurrentProductAction}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="back" value={BACK} />
                    <SubmitButton className={smallPrimary} confirm={`Make version ${p.version} the one customers download?`}>Make current</SubmitButton></form>
                )}
                <a href={`/admin/downloads/get?id=${p.id}`} className={smallBtn}>Test download</a>
                {!p.is_current && (
                  <form action={deleteProductAction}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="back" value={BACK} />
                    <SubmitButton className={`${smallBtn} !text-red-300`} confirm={`Remove version ${p.version} from the list? The file stays in storage.`}>Remove</SubmitButton></form>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
