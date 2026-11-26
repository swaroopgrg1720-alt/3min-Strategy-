/** Password rules shared by the browser (live checklist) and the server (the real enforcement). */
export const MIN_LENGTH = 12;
export const MAX_LENGTH = 128;

export const PASSWORD_RULES: { id: string; label: string; test: (p: string) => boolean }[] = [
  { id: "len", label: `At least ${MIN_LENGTH} characters`, test: (p) => p.length >= MIN_LENGTH },
  { id: "case", label: "Upper and lower case letters", test: (p) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
  { id: "num", label: "A number", test: (p) => /\d/.test(p) },
  { id: "sym", label: "A symbol such as ! ? # $ %", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

const COMMON = ["password", "passw0rd", "qwerty", "letmein", "welcome", "admin", "iloveyou", "123456", "abcdef", "monkey", "dragon", "trading", "forex", "3minscalp", "scalp"];

/** Returns a problem message, or "" when the password is acceptable. */
export function passwordProblem(pw: string, email?: string): string {
  if (pw.length > MAX_LENGTH) return `Use at most ${MAX_LENGTH} characters.`;
  const failed = PASSWORD_RULES.find((r) => !r.test(pw));
  if (failed) return `Password needs: ${failed.label.toLowerCase()}.`;
  const low = pw.toLowerCase();
  if (COMMON.some((w) => low.includes(w))) return "That password is too easy to guess. Avoid common words.";
  if (/(.)\1{3,}/.test(pw)) return "Avoid repeating the same character many times.";
  const local = (email ?? "").split("@")[0]?.toLowerCase();
  if (local && local.length >= 4 && low.includes(local)) return "Do not use your email name in the password.";
  return "";
}

/** 0 to 4 for the strength bar. */
export function passwordScore(pw: string): number {
  if (!pw) return 0;
  const met = PASSWORD_RULES.filter((r) => r.test(pw)).length;
  if (met < 4) return Math.min(met, 2);
  return pw.length >= 16 ? 4 : 3;
}
