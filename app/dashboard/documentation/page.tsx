import Link from "next/link";
export default function Page() {
  return (<><h1 className="mb-6 text-2xl font-bold">Documentation</h1>
    <div className="card"><p className="text-sm text-muted">Installation and setup guidance lives on the public documentation page.</p>
    <Link href="/documentation" className="btn btn-primary mt-5">Open Documentation</Link></div></>);
}
