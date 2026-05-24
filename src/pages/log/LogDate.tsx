import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Check,
  AlertCircle,
} from 'lucide-react';
import { useLogFlowStore } from '@/store/logFlowStore';
import type { DateType } from '@/types/log';
import {
  startOfDay,
  startOfWeek,
  endOfWeek,
  addDays,
  startOfMonth,
  sameDay,
  inRange,
  formatDate,
  formatDateRange,
  WEEKDAYS_SHORT,
} from '@/utils/date';
import { PageHeader } from '@/components/ui/PageHeader';
import { PickerCard } from '@/components/ui/PickerCard';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

// ── Log Date Page ─────────────────────────────────────────────────────────

export default function LogDate() {
  const navigate = useNavigate();
  const { contextName, setDate } = useLogFlowStore();
  const [mode, setMode] = useState<DateType | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedWeekStart, setSelectedWeekStart] = useState<Date | null>(null);
  const [rangeFrom, setRangeFrom] = useState<Date | null>(null);
  const [rangeTo, setRangeTo] = useState<Date | null>(null);

  const contextLabel = contextName ?? 'Self';

  // Computed readiness
  const ready =
    (mode === 'daily' && selectedDay != null) ||
    (mode === 'weekly' && selectedWeekStart != null) ||
    (mode === 'custom' && (rangeFrom != null || rangeTo != null));

  function handleContinue() {
    if (!mode) return;
    let start: Date;
    let end: Date;

    if (mode === 'daily' && selectedDay) {
      start = startOfDay(selectedDay);
      end = startOfDay(selectedDay);
    } else if (mode === 'weekly' && selectedWeekStart) {
      start = selectedWeekStart;
      end = endOfWeek(selectedWeekStart);
    } else if (mode === 'custom') {
      const a = rangeFrom ?? rangeTo!;
      const b = rangeTo ?? rangeFrom!;
      start = +a <= +b ? a : b;
      end = +a <= +b ? b : a;
    } else {
      return;
    }

    setDate(mode, start, end);
    navigate('/log/entry');
  }

  function handleModeSwitch(next: DateType) {
    setMode(next);
    setSelectedDay(null);
    setSelectedWeekStart(null);
    setRangeFrom(null);
    setRangeTo(null);
  }

  // ── Step 1: pick mode ──────────────────────────────────────────────────
  if (!mode) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-16">
        <PageHeader
          eyebrow={`New log · ${contextLabel}`}
          title="When did you do this work?"
          subtitle="Choose how you want to describe the time period."
        />
        <div className="grid sm:grid-cols-3 gap-4">
          <PickerCard
            tint="blue"
            icon={CalendarDays}
            title="Daily"
            subtitle="Single day entry"
            onClick={() => setMode('daily')}
          />
          <PickerCard
            tint="cream"
            icon={CalendarRange}
            title="Weekly"
            subtitle="Whole week entry"
            onClick={() => setMode('weekly')}
          />
          <PickerCard
            tint="sage"
            icon={CalendarRange}
            title="Custom"
            subtitle="Pick your own range"
            onClick={() => setMode('custom')}
          />
        </div>
      </div>
    );
  }

  // ── Step 2: pick date ──────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-16">
      <PageHeader
        eyebrow={`New log · ${contextLabel}`}
        title="When did you do this work?"
        subtitle="Pick a date or range below."
      />

      {/* Mode tabs */}
      <ModeTabs mode={mode} onChange={handleModeSwitch} />

      <div className="mt-6">
        {mode === 'daily' && (
          <Calendar
            kind="day"
            selectedDay={selectedDay ?? undefined}
            onSelectDay={setSelectedDay}
          />
        )}
        {mode === 'weekly' && (
          <Calendar
            kind="week"
            selectedWeek={selectedWeekStart ?? undefined}
            onSelectWeek={(d) => setSelectedWeekStart(startOfWeek(d))}
          />
        )}
        {mode === 'custom' && (
          <CustomRange
            from={rangeFrom ?? undefined}
            to={rangeTo ?? undefined}
            onChange={({ from, to }) => {
              setRangeFrom(from ?? null);
              setRangeTo(to ?? null);
            }}
          />
        )}
      </div>

      {/* Footer */}
      <div className="mt-7 flex items-center justify-between gap-3 flex-wrap">
        <SelectionSummary mode={mode} day={selectedDay} weekStart={selectedWeekStart} from={rangeFrom} to={rangeTo} />
        <Button
          size="lg"
          trailingIcon={<ArrowRight size={14} />}
          disabled={!ready}
          onClick={handleContinue}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

// ── Mode Tabs ─────────────────────────────────────────────────────────────

const TABS: { id: DateType; label: string }[] = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'custom', label: 'Custom' },
];

function ModeTabs({ mode, onChange }: { mode: DateType; onChange: (m: DateType) => void }) {
  return (
    <div className="inline-flex bg-gray-100 dark:bg-surface-3 border border-gray-200 dark:border-[#2A2A2A] rounded-xl p-1 gap-0.5">
      {TABS.map((tab) => {
        const active = mode === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'px-4 py-2 rounded-[10px] text-[13.5px] font-medium transition-all duration-150',
              active
                ? 'bg-white dark:bg-surface-2 text-ink dark:text-white font-semibold shadow-card'
                : 'text-ink-2 hover:text-ink dark:hover:text-white',
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Selection Summary ─────────────────────────────────────────────────────

interface SelectionSummaryProps {
  mode: DateType;
  day: Date | null;
  weekStart: Date | null;
  from: Date | null;
  to: Date | null;
}

function SelectionSummary({ mode, day, weekStart, from, to }: SelectionSummaryProps) {
  let text = '';

  if (mode === 'daily' && day) {
    text = formatDate(day, 'long');
  } else if (mode === 'weekly' && weekStart) {
    text = formatDateRange(weekStart, endOfWeek(weekStart));
  } else if (mode === 'custom') {
    const a = from ?? to;
    const b = to ?? from;
    if (a && b) text = formatDateRange(+a <= +b ? a : b, +a <= +b ? b : a);
    else if (a) text = formatDate(a, 'medium');
  }

  if (!text) {
    return (
      <span className="text-[13.5px] text-ink-3">Pick a date to continue</span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 text-[13.5px] text-ink-2">
      <Check size={14} className="text-sage-accent" />
      {text}
    </span>
  );
}

// ── Calendar ──────────────────────────────────────────────────────────────

interface CalendarProps {
  kind: 'day' | 'week' | 'range';
  selectedDay?: Date;
  selectedWeek?: Date;
  rangeFrom?: Date;
  rangeTo?: Date;
  onSelectDay?: (d: Date) => void;
  onSelectWeek?: (d: Date) => void;
  onSelectRange?: (d: Date) => void;
  initialMonth?: Date;
}

export function Calendar({
  kind,
  selectedDay,
  selectedWeek,
  rangeFrom,
  rangeTo,
  onSelectDay,
  onSelectWeek,
  onSelectRange,
  initialMonth,
}: CalendarProps) {
  const today = startOfDay(new Date());
  const [view, setView] = useState(() =>
    startOfMonth(initialMonth ?? selectedDay ?? selectedWeek ?? today),
  );
  const [hoverWeekStart, setHoverWeekStart] = useState<Date | null>(null);

  const monthLabel = view.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Build 6×7 grid starting from the Mon before/at month start
  const firstWeekStart = startOfWeek(startOfMonth(view));
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) cells.push(addDays(firstWeekStart, i));

  return (
    <div className="bg-white dark:bg-surface-2 border border-gray-100 dark:border-[#2A2A2A] rounded-card-xl p-6 shadow-card-lg">
      {/* Month header */}
      <div className="flex items-center justify-between mb-5">
        <span className="text-[16px] font-semibold text-ink dark:text-white">
          {monthLabel}
        </span>
        <div className="flex gap-1">
          <MonthNavBtn
            label="Previous month"
            onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
          >
            <ChevronLeft size={16} />
          </MonthNavBtn>
          <MonthNavBtn
            label="Next month"
            onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
          >
            <ChevronRight size={16} />
          </MonthNavBtn>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS_SHORT.map((w) => (
          <span
            key={w}
            className="text-center text-[11px] font-semibold text-ink-3 uppercase tracking-[0.06em] py-1"
          >
            {w}
          </span>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          const inMonth = d.getMonth() === view.getMonth();
          const isToday = sameDay(d, today);
          const wStart = startOfWeek(d);

          let isSelected = false;
          let isInRange = false;
          let isRangeStart = false;
          let isRangeEnd = false;
          let isHoveredWeek = false;

          if (kind === 'day') {
            isSelected = selectedDay != null && sameDay(d, selectedDay);
          } else if (kind === 'week') {
            const wkStart = selectedWeek ? startOfWeek(selectedWeek) : null;
            if (wkStart && +wStart === +wkStart) isInRange = true;
            if (hoverWeekStart && +wStart === +hoverWeekStart) isHoveredWeek = true;
            isRangeStart = isInRange && d.getDay() === 1; // Mon
            isRangeEnd = isInRange && d.getDay() === 0; // Sun
          } else if (kind === 'range') {
            const a = rangeFrom;
            const b = rangeTo;
            if (a && b) {
              isInRange = inRange(d, a, b);
              const lo = +a <= +b ? a : b;
              const hi = +a <= +b ? b : a;
              isRangeStart = sameDay(d, lo);
              isRangeEnd = sameDay(d, hi);
            } else if (a) {
              isSelected = sameDay(d, a);
            } else if (b) {
              isSelected = sameDay(d, b);
            }
          }

          return (
            <DayCell
              key={i}
              date={d}
              inMonth={inMonth}
              isToday={isToday}
              isSelected={isSelected}
              isInRange={isInRange || isHoveredWeek}
              isRangeStart={isRangeStart}
              isRangeEnd={isRangeEnd}
              onMouseEnter={
                kind === 'week' ? () => setHoverWeekStart(wStart) : undefined
              }
              onMouseLeave={
                kind === 'week' ? () => setHoverWeekStart(null) : undefined
              }
              onClick={() => {
                if (kind === 'day') onSelectDay?.(d);
                else if (kind === 'week') onSelectWeek?.(d);
                else onSelectRange?.(d);
              }}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3.5 mt-4 text-[12px] text-ink-3">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full border-[1.5px] border-accent-light inline-block" />
          Today
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-accent inline-block" />
          {kind === 'day' ? 'Selected' : kind === 'week' ? 'Selected week' : 'Range'}
        </span>
      </div>
    </div>
  );
}

// ── Day Cell ──────────────────────────────────────────────────────────────

interface DayCellProps {
  date: Date;
  inMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isInRange: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  onClick: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

function DayCell({
  date,
  inMonth,
  isToday,
  isSelected,
  isInRange,
  isRangeStart,
  isRangeEnd,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: DayCellProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        'relative h-10 flex items-center justify-center text-[13.5px] font-medium',
        'transition-all duration-100 cursor-pointer focus:outline-none',
        // base border radius
        'rounded-[10px]',
        // range interior cells: square corners on inner sides
        isInRange && !isRangeStart && !isRangeEnd && 'rounded-none',
        isRangeStart && !isRangeEnd && 'rounded-l-[10px] rounded-r-none',
        isRangeEnd && !isRangeStart && 'rounded-r-[10px] rounded-l-none',
        // colors
        isSelected
          ? 'bg-accent text-white font-bold'
          : isInRange
          ? 'bg-accent-tint text-ink dark:text-white'
          : inMonth
          ? 'text-ink dark:text-white hover:bg-gray-100 dark:hover:bg-surface-3'
          : 'text-ink-3 hover:bg-gray-50 dark:hover:bg-surface-3',
        // today ring
        isToday && !isSelected && 'ring-[1.5px] ring-inset ring-accent-light',
      )}
    >
      {date.getDate()}
      {/* Today dot */}
      {isToday && !isSelected && (
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
      )}
    </button>
  );
}

// ── Month Nav Btn ─────────────────────────────────────────────────────────

function MonthNavBtn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-2 hover:bg-gray-100 dark:hover:bg-surface-3 hover:text-ink transition-colors"
    >
      {children}
    </button>
  );
}

// ── Custom Range ──────────────────────────────────────────────────────────

interface CustomRangeProps {
  from?: Date;
  to?: Date;
  onChange: (next: { from?: Date; to?: Date }) => void;
}

function CustomRange({ from, to, onChange }: CustomRangeProps) {
  const [picking, setPicking] = useState<'from' | 'to'>('from');

  function handlePick(d: Date) {
    const picked = startOfDay(d);
    if (picking === 'from') {
      // If new from > existing to, clear to
      const newTo = to && +picked > +to ? undefined : to;
      onChange({ from: picked, to: newTo });
      setPicking('to');
    } else {
      if (from && +picked < +from) {
        onChange({ from: picked, to: from });
      } else {
        onChange({ from, to: picked });
      }
      setPicking('from');
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Date fields */}
      <div className="grid grid-cols-2 gap-3">
        <DateField
          label="From"
          value={from}
          active={picking === 'from'}
          onClick={() => setPicking('from')}
        />
        <DateField
          label="To"
          value={to}
          active={picking === 'to'}
          onClick={() => setPicking('to')}
        />
      </div>

      <Calendar
        kind="range"
        rangeFrom={from}
        rangeTo={to}
        onSelectRange={handlePick}
        initialMonth={from ?? to ?? new Date()}
      />

      <p className="flex items-center gap-1.5 text-[12.5px] text-ink-3">
        <AlertCircle size={13} />
        Pick a single date for one day, or both ends for a range.
      </p>
    </div>
  );
}

function DateField({
  label,
  value,
  active,
  onClick,
}: {
  label: string;
  value?: Date;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'text-left h-16 rounded-xl px-4 flex flex-col justify-center gap-1',
        'bg-white dark:bg-surface-2 border transition-all duration-150',
        active
          ? 'border-accent shadow-[0_0_0_4px_rgba(126,176,247,0.18)]'
          : 'border-gray-200 dark:border-[#2A2A2A]',
      )}
    >
      <span className="text-[11px] font-semibold text-ink-3 uppercase tracking-[0.06em]">
        {label}
      </span>
      <span
        className={cn(
          'text-[14.5px] font-semibold',
          value ? 'text-ink dark:text-white' : 'text-ink-3',
        )}
      >
        {value ? formatDate(value, 'medium') : 'Pick a date'}
      </span>
    </button>
  );
}
