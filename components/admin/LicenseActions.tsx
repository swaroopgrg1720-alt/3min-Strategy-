"use client";

import { useEffect, useState } from "react";
import { SubmitButton } from "@/components/admin/SubmitButton";
import {
  deleteLicenseAction, extendLicenseAction, resetAccountAction, setExpiryAction, setLicenseStatusAction,
} from "@/app/admin/actions";

export interface LicenseLite {
  id: string; ref: string; email: string; plan: "monthly" | "lifetime"; status: string; mt5: string | null; expires: string | null;
}

const row = "flex min-h-[52px] w-full items-center gap-3 rounded-2xl border border-line bg-bg px-4 text-left text-[15px] font-medium active:bg-forest/40";

/** The ⋮ button on each license, and the sheet of actions it opens. */
export function LicenseActions({ license, back, resetKey }: { license: LicenseLite; back: string; resetKey?: string }) {
  const [open, setOpen] = useState(false);
  const [askDelete, setAskDelete] = useState(false);

  useEffect(() => { setOpen(false); setAskDelete(false); }, [resetKey]); // close after an action finishes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open]);

  const hidden = (extra: Record<string, string> = {}) => (
    <>
      <input type="hidden" name="id" value={license.id} />
      <input type="hidden" name="back" value={back} />
      {Object.entries(extra).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
    </>
  );
  const monthly = license.plan === "monthly";
  const defaultDate = (license.expires ? new Date(license.expires) : new Date()).toISOString().slice(0, 10);

  return (
    <>
      <button type="button" aria-label={`Actions for ${license.ref}`} aria-haspopup="dialog" onClick={() => setOpen(true)}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line text-ink active:bg-forest/40">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="5" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="12" cy="19" r="1.8" /></svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
          <button aria-label="Close" className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div role="dialog" aria-label={`Actions for ${license.ref}`} className="relative max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-line bg-bg2 p-5 sm:rounded-3xl">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-mono text-sm text-accent">{license.ref}</p>
                <p className="truncate text-sm text-muted">{license.email}</p>
              </div>
              <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full active:bg-forest/40">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
              </button>
            </div>

            {monthly && (
              <section className="mt-5" aria-label="Add time">
                <h3 className="mb-2 text-sm font-semibold text-muted">Add time</h3>
                <div className="grid grid-cols-3 gap-2">
                  {[7, 30, 90].map((d) => (
                    <form key={d} action={extendLicenseAction}>
                      {hidden({ days: String(d) })}
                      <SubmitButton className="btn btn-primary w-full !px-2">+{d} days</SubmitButton>
                    </form>
                  ))}
                </div>
                <form action={setExpiryAction} className="mt-3 flex gap-2">
                  {hidden()}
                  <input type="date" name="date" defaultValue={defaultDate} required aria-label="Expiry date" className="w-full min-w-0 rounded-xl border border-line bg-bg px-3 py-3 text-base" />
                  <SubmitButton className="btn btn-ghost shrink-0 !px-4">Set expiry</SubmitButton>
                </form>
              </section>
            )}

            <section className="mt-5 space-y-2" aria-label="Status">
              <h3 className="mb-2 text-sm font-semibold text-muted">Status</h3>
              {license.status === "active" ? (
                <form action={setLicenseStatusAction}>{hidden({ status: "suspended" })}<SubmitButton className={row}>Suspend (can be turned back on)</SubmitButton></form>
              ) : (
                <form action={setLicenseStatusAction}>{hidden({ status: "active" })}<SubmitButton className={row}>Reactivate</SubmitButton></form>
              )}
              {license.status !== "revoked" && (
                <form action={setLicenseStatusAction}>{hidden({ status: "revoked" })}<SubmitButton className={row} confirm="Revoke this license? The key stops working.">Revoke</SubmitButton></form>
              )}
              {license.mt5 && (
                <form action={resetAccountAction}>{hidden()}<SubmitButton className={row} confirm={`Unbind MT5 account ${license.mt5}? The customer can enter a new one.`}>Unbind MT5 account {license.mt5}</SubmitButton></form>
              )}
            </section>

            <section className="mt-5" aria-label="Delete">
              <h3 className="mb-2 text-sm font-semibold text-muted">Danger zone</h3>
              {!askDelete ? (
                <button type="button" onClick={() => setAskDelete(true)} className={`${row} border-red-400/40 text-red-300`}>Delete license…</button>
              ) : (
                <div className="rounded-2xl border border-red-400/40 bg-red-400/10 p-4">
                  <p className="text-sm text-red-200">Delete {license.ref} permanently? The customer loses access and the key cannot be restored.</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setAskDelete(false)} className="btn btn-ghost">Keep it</button>
                    <form action={deleteLicenseAction}>{hidden()}<SubmitButton className="btn w-full bg-red-400 text-bg">Yes, delete</SubmitButton></form>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      )}
    </>
  );
}
