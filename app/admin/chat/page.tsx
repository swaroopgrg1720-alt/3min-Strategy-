import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { PageHead } from "@/components/admin/ui";
import { ChatConsole } from "@/components/admin/ChatConsole";

export const metadata: Metadata = { title: "Live chat | Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ thread?: string }> }) {
  const sp = await searchParams;
  await requireAdmin();
  const id = sp.thread && /^[0-9a-f-]{36}$/i.test(sp.thread) ? sp.thread : undefined;
  return (
    <>
      <PageHead title="Live chat" text="Conversations started from the chat widget on your website. Replies appear instantly for the visitor." />
      <ChatConsole initialId={id} />
    </>
  );
}
