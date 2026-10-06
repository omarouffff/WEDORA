/**
 * Pure business logic. No I/O here so it can be unit-tested and reused by both
 * server components and server actions.
 */

export type RSVPState = "PENDING" | "CONFIRMED" | "DECLINED";
export type BookingState = "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED" | "COMPLETED";
export type Actor = "COUPLE" | "VENDOR" | "ADMIN";

export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainError";
  }
}

// ───────── Planner ─────────

export function planningProgress(statuses: readonly string[]) {
  if (!statuses.length) return 0;
  return Math.round((statuses.filter((s) => s === "DONE").length / statuses.length) * 100);
}

/** Midnight (UTC) of the given instant — DATE columns are stored at UTC midnight. */
export function startOfUtcDay(now: Date = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export function isOverdue(task: { status: string; dueDate: Date | null }, now: Date = new Date()) {
  return task.status !== "DONE" && !!task.dueDate && task.dueDate.getTime() < startOfUtcDay(now).getTime();
}

export function daysUntil(date: Date | string | null | undefined, now: Date = new Date()) {
  if (!date) return null;
  const target = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(target.getTime())) return null;
  const diff = startOfUtcDay(target).getTime() - startOfUtcDay(now).getTime();
  return Math.round(diff / 86_400_000);
}

// ───────── Budget ─────────

export function budgetSummary(total: number, amounts: readonly number[], planned = 0) {
  const spent = amounts.reduce((a, b) => a + b, 0);
  return {
    total,
    planned,
    spent,
    remaining: total - spent,
    overBudget: spent > total,
    /** 0 when there is no budget yet, so the UI never shows NaN/Infinity. */
    percentSpent: total > 0 ? Math.round((spent / total) * 100) : 0,
  };
}

// ───────── Guests ─────────

export function guestSummary(statuses: readonly RSVPState[]) {
  return {
    total: statuses.length,
    confirmed: statuses.filter((s) => s === "CONFIRMED").length,
    pending: statuses.filter((s) => s === "PENDING").length,
    declined: statuses.filter((s) => s === "DECLINED").length,
  };
}

/** Headcount (guest + plus-ones) of attending / invited parties. */
export function headcount(guests: readonly { status: RSVPState; partySize: number }[]) {
  return {
    invited: guests.reduce((n, g) => n + g.partySize, 0),
    attending: guests.filter((g) => g.status === "CONFIRMED").reduce((n, g) => n + g.partySize, 0),
  };
}

/** Normalises a phone/email into a stable key used to dedupe RSVPs and guests. */
export function contactKey(raw: string) {
  const v = raw.trim().toLowerCase();
  if (v.includes("@")) return v;
  const digits = v.replace(/[^\d]/g, "");
  // Egyptian numbers: 01012345678 == +201012345678 == 00201012345678
  if (digits.startsWith("0020")) return `+${digits.slice(2)}`;
  if (digits.startsWith("20") && digits.length >= 12) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 11) return `+20${digits.slice(1)}`;
  return digits ? `+${digits}` : v;
}

// ───────── Bookings ─────────

const GRAPH: Record<BookingState, BookingState[]> = {
  PENDING: ["CONFIRMED", "REJECTED", "CANCELLED"],
  CONFIRMED: ["CANCELLED", "COMPLETED"],
  REJECTED: [],
  CANCELLED: [],
  COMPLETED: [],
};

/** Which actors may perform each target transition. */
const WHO: Record<BookingState, Actor[]> = {
  PENDING: [],
  CONFIRMED: ["VENDOR", "ADMIN"],
  REJECTED: ["VENDOR", "ADMIN"],
  CANCELLED: ["COUPLE", "VENDOR", "ADMIN"],
  COMPLETED: ["VENDOR", "ADMIN"],
};

export function bookingTransition(current: string, next: string) {
  if (!GRAPH[current as BookingState]?.includes(next as BookingState)) {
    throw new DomainError(`A booking can't change from ${current.toLowerCase()} to ${next.toLowerCase()}.`);
  }
  return next as BookingState;
}

export function authorizeBookingTransition(args: {
  from: BookingState;
  to: BookingState;
  actor: Actor;
  eventDate: Date;
  now?: Date;
}) {
  bookingTransition(args.from, args.to);
  if (!WHO[args.to].includes(args.actor)) {
    throw new DomainError("You don't have permission to make this change to the booking.");
  }
  if (args.to === "COMPLETED" && args.actor !== "ADMIN") {
    if (args.eventDate.getTime() > startOfUtcDay(args.now).getTime()) {
      throw new DomainError("A booking can only be marked completed on or after the event date.");
    }
  }
  return args.to;
}

export const BOOKING_LABEL: Record<BookingState, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  REJECTED: "Declined",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
};

// ───────── Reviews ─────────

export function averageRating(ratings: readonly number[]) {
  if (!ratings.length) return 0;
  const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  return Math.round(avg * 10) / 10;
}

export function canReview(booking: { status: BookingState; hasReview: boolean }) {
  if (booking.status !== "COMPLETED") {
    throw new DomainError("You can only review a vendor after your booking is completed.");
  }
  if (booking.hasReview) throw new DomainError("You've already reviewed this booking.");
  return true;
}
