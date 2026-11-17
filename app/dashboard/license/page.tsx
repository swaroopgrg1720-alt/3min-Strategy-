import { Empty } from "@/components/dashboard/DashboardShell";
export default function Page() {
  return (<><h1 className="mb-6 text-2xl font-bold">My License</h1>
    <Empty title="No license found" text="Once your payment is confirmed server-side, your license (ID, plan, expiry, MT5 account, activation status) appears here. License keys are never exposed publicly." /></>);
}
