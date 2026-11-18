import "server-only";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

/** Runs an admin action; on failure shows the reason on the page instead of crashing. */
export async function guarded(path: string, fn: () => Promise<void>) {
  let failure = "";
  try {
    await fn();
  } catch (e) {
    failure = e instanceof Error ? e.message : "Unknown error";
  }
  if (failure) redirect(`${path}?error=${encodeURIComponent(failure.slice(0, 300))}`);
  revalidatePath(path);
  revalidatePath("/admin");
}
