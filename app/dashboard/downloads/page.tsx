import { Empty } from "@/components/dashboard/DashboardShell";
export default function Page() {
  return (<><h1 className="mb-6 text-2xl font-bold">Download</h1>
    <Empty title="Downloads not enabled" text="Flow: login → license validation → short-lived secure download. The EX5 is never hosted at a public permanent URL." /></>);
}
