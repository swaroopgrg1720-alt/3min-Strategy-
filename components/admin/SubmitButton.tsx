"use client";

import { useFormStatus } from "react-dom";
import { Spinner } from "@/components/ui/Spinner";

/** Submit button that shows a spinner while the action runs, and can ask "are you sure?" first. */
export function SubmitButton({ children, className = "", confirm }: { children: React.ReactNode; className?: string; confirm?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`${className} disabled:opacity-60`}
      onClick={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
    >
      {pending && <Spinner size={14} />}
      {children}
    </button>
  );
}
