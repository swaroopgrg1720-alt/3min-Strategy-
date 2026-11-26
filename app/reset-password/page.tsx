import { redirect } from "next/navigation";

/** Password resets now use a one-time code on the sign-in page. */
export default function Page() {
  redirect("/login");
}
