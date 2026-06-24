"use client";
import { useState, useEffect } from "react";

function diffParts(target: Date) {
  const now = Date.now();
  let delta = Math.max(0, Math.floor((target.getTime() - now) / 1000));
  const days = Math.floor(delta / 86400);
  delta -= days * 86400;
  const hours = Math.floor(delta / 3600);
  delta -= hours * 3600;
  const minutes = Math.floor(delta / 60);
  const seconds = delta - minutes * 60;
  return { days, hours, minutes, seconds, done: target.getTime() <= now };
}

export default function Countdown({ date, compact = false }: { date: string; compact?: boolean }) {
  const [parts, setParts] = useState<ReturnType<typeof diffParts> | null>(null);

  useEffect(() => {
    const target = new Date(date + "T09:00:00+05:30");
    const tick = () => setParts(diffParts(target));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [date]);

  if (!parts) return null;
  if (parts.done) {
    return <span className="text-xs font-bold text-red-600">Happening now / started</span>;
  }

  if (compact) {
    return (
      <span className="text-xs font-bold text-indigo-600 tabular-nums">
        {parts.days}d {parts.hours}h {parts.minutes}m
      </span>
    );
  }

  const cell = (val: number, label: string) => (
    <div className="flex flex-col items-center">
      <div className="bg-white/20 rounded-md px-2 py-1 min-w-[2.4rem] text-center">
        <span className="text-lg font-black text-white tabular-nums">
          {String(val).padStart(2, "0")}
        </span>
      </div>
      <span className="text-[9px] text-white/70 uppercase mt-0.5">{label}</span>
    </div>
  );

  return (
    <div className="flex items-center gap-1.5">
      {cell(parts.days, "days")}
      {cell(parts.hours, "hrs")}
      {cell(parts.minutes, "min")}
      {cell(parts.seconds, "sec")}
    </div>
  );
}
