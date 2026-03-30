"use client";

import { useState } from "react";
import Link from "next/link";
import type { EventData } from "./event-views";

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function CalendarGrid({
  events,
  groupId,
}: {
  events: EventData[];
  groupId: string;
}) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Group events by date
  const eventsByDate = new Map<string, EventData[]>();
  for (const event of events) {
    const key = toDateKey(new Date(event.start_time));
    if (!eventsByDate.has(key)) {
      eventsByDate.set(key, []);
    }
    eventsByDate.get(key)!.push(event);
  }

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const todayKey = toDateKey(today);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDay(null);
  };

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const selectedEvents = selectedDay ? eventsByDate.get(selectedDay) ?? [] : [];

  return (
    <div className="space-y-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="p-2 rounded-lg hover:bg-card-border/50 transition-colors font-bold text-foreground/60"
        >
          &larr;
        </button>
        <h3 className="font-bold text-lg">
          {MONTHS[currentMonth]} {currentYear}
        </h3>
        <button
          onClick={nextMonth}
          className="p-2 rounded-lg hover:bg-card-border/50 transition-colors font-bold text-foreground/60"
        >
          &rarr;
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-foreground/40 py-1"
          >
            {day}
          </div>
        ))}

        {/* Day Cells */}
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="aspect-square" />;
          }

          const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const hasEvents = eventsByDate.has(dateKey);
          const isToday = dateKey === todayKey;
          const isSelected = dateKey === selectedDay;
          const dayEvents = eventsByDate.get(dateKey) ?? [];

          return (
            <button
              key={dateKey}
              onClick={() => setSelectedDay(isSelected ? null : dateKey)}
              className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 text-sm font-semibold transition-all relative ${
                isSelected
                  ? "bg-accent text-white shadow-md shadow-accent/30"
                  : isToday
                    ? "bg-warm-orange/20 text-warm-orange ring-2 ring-warm-orange/40"
                    : hasEvents
                      ? "bg-card hover:bg-card-border/40 text-foreground"
                      : "text-foreground/40 hover:bg-card-border/20"
              }`}
            >
              {day}
              {hasEvents && (
                <div className="flex gap-0.5">
                  {dayEvents.slice(0, 3).map((_, j) => (
                    <div
                      key={j}
                      className={`w-1 h-1 rounded-full ${
                        isSelected ? "bg-white/70" : "bg-accent"
                      }`}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Events */}
      {selectedDay && (
        <div className="space-y-2">
          <h4 className="font-bold text-sm text-foreground/60">
            {new Date(selectedDay + "T12:00:00").toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </h4>
          {selectedEvents.length === 0 ? (
            <p className="text-sm text-foreground/40 card-spring p-4 text-center">
              Nothing planned — be the one to change that!
            </p>
          ) : (
            selectedEvents.map((event) => {
              const start = new Date(event.start_time);
              return (
                <Link
                  key={event.id}
                  href={`/g/${groupId}/event/${event.id}`}
                  className="block card-spring p-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold">{event.title}</p>
                      {event.location && (
                        <p className="text-xs text-foreground/50">
                          {event.location}
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-accent">
                      {start.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
