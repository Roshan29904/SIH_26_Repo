import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Every shadcn / animate-ui component calls cn(...) to build its
// className. clsx() lets you pass conditional classes
// (cn("a", isActive && "b")); twMerge() then resolves conflicts
// when two Tailwind classes target the same property (e.g. if a
// component's default "p-4" needs to be overridden by a "p-2" you
// pass in — plain string concatenation would apply both and let
// CSS specificity decide arbitrarily; twMerge keeps only the
// intended one).
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
