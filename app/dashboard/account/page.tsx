import { Empty } from "@/components/dashboard/DashboardShell";
export default function Page() {
  return (<><h1 className="mb-6 text-2xl font-bold">Account</h1>
    <Empty title="Not signed in" text="Account details (email, password reset) appear here once authentication is connected." /></>);
}
