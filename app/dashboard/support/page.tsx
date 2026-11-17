import Link from "next/link";
import { Empty } from "@/components/dashboard/DashboardShell";
export default function Page() {
  return (<><h1 className="mb-6 text-2xl font-bold">Support</h1>
    <Empty title="No tickets yet" text="Ticketing is not connected. For now, use the contact form." />
    <div className="mt-6"><Link href="/contact" className="btn btn-primary">Contact Support</Link></div></>);
}
