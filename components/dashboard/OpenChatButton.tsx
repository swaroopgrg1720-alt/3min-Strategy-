"use client";

export function OpenChatButton({ className, children }: { className?: string; children: React.ReactNode }) {
  return <button type="button" className={className} onClick={() => window.dispatchEvent(new Event("3ms:open-chat"))}>{children}</button>;
}
