"use client";

export function LocalDate({ iso, options }: { iso: string; options?: Intl.DateTimeFormatOptions }) {
  const date = new Date(iso);
  return (
    <span suppressHydrationWarning>
      {date.toLocaleDateString("en-US", options ?? {
        weekday: "long",
        month: "long",
        day: "numeric",
      })}
    </span>
  );
}

export function LocalTime({ iso }: { iso: string }) {
  const date = new Date(iso);
  return (
    <span suppressHydrationWarning>
      {date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })}
    </span>
  );
}

export function LocalDateShort({ iso }: { iso: string }) {
  const date = new Date(iso);
  return (
    <span suppressHydrationWarning>
      {date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })}
    </span>
  );
}
