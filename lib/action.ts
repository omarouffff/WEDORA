import { z } from "zod/v4";
import { Prisma } from "@prisma/client";
import { AuthError, ForbiddenError, NotFoundError } from "@/lib/errors";
import { DomainError } from "@/lib/calculations";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export const ok = <T = undefined>(data?: T, message?: string): ActionResult<T> => ({ ok: true, data, message });
export const fail = (error: string, fieldErrors?: Record<string, string>): ActionResult<never> => ({
  ok: false,
  error,
  fieldErrors,
});

/** Validates `input` and returns either parsed data or a ready-to-return field-error result. */
export function parse<S extends z.ZodType>(
  schema: S,
  input: unknown,
): { ok: true; data: z.output<S> } | { ok: false; result: ActionResult<never> } {
  const parsed = schema.safeParse(input);
  if (parsed.success) return { ok: true, data: parsed.data };
  const fieldErrors: Record<string, string> = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path.join(".") || "_";
    fieldErrors[key] ??= issue.message;
  }
  const first = Object.values(fieldErrors)[0] ?? "Please check the form and try again.";
  return { ok: false, result: fail(first, fieldErrors) };
}

/** Next.js control-flow errors (redirect / notFound) must propagate untouched. */
function isNextControlFlow(error: unknown) {
  const digest = (error as { digest?: unknown } | null)?.digest;
  return typeof digest === "string" && digest.startsWith("NEXT_");
}

/**
 * Wraps an action body so every failure becomes a friendly, non-leaky message.
 * Stack traces and DB details are logged server-side only.
 */
export async function guarded<T>(fn: () => Promise<ActionResult<T>>): Promise<ActionResult<T>> {
  try {
    return await fn();
  } catch (error) {
    if (isNextControlFlow(error)) throw error;
    if (error instanceof AuthError || error instanceof ForbiddenError || error instanceof NotFoundError || error instanceof DomainError) {
      return fail(error.message);
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") return fail("That already exists.");
      if (error.code === "P2025") return fail("We couldn't find that record.");
      if (error.code === "P2003") return fail("This is linked to other records and can't be changed right now.");
    }
    console.error("[action error]", error);
    return fail("Something went wrong on our side. Please try again in a moment.");
  }
}
