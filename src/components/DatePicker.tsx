import { useState, useEffect, useRef } from 'react';
import { getDaysInMonth, getMonthOffset, getWeekStart } from '../utils/calendar';
import type { Translations } from '../i18n';

interface Props {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  min?: string;  // YYYY-MM-DD — days before this are disabled
  locale: string;
  t: Translations;
  label: string;
}

const parseYMD = (s: string): { y: number; m: number; d: number } => {
  const [y, m, d] = s.split('-').map(Number);
  return { y, m: m - 1, d };
};

const toYMD = (y: number, m: number, d: number): string =>
  `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

const monthName = (year: number, month: number, locale: string): string =>
  new Date(year, month, 1).toLocaleString(locale, { month: 'long', year: 'numeric' });

const weekdayNames = (locale: string, weekStart: number): string[] => {
  const names: string[] = [];
  // Build 7 weekday names starting from weekStart
  for (let i = 0; i < 7; i++) {
    const day = (weekStart + i) % 7;
    const date = new Date(2023, 0, 1 + day); // Jan 1 2023 = Sunday
    names.push(date.toLocaleString(locale, { weekday: 'narrow' }));
  }
  return names;
};

export default function DatePicker({ value, onChange, min, locale, t, label }: Props) {
  const { y: initY, m: initM } = parseYMD(value);
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(initY);
  const [viewMonth, setViewMonth] = useState(initM);
  const ref = useRef<HTMLDivElement>(null);

  // Sync view to value when it changes externally
  useEffect(() => {
    const { y, m } = parseYMD(value);
    setViewYear(y);
    setViewMonth(m);
  }, [value]);

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
    };
  }, [open]);

  // Flip popover if too close to viewport edge
  useEffect(() => {
    if (!open || !ref.current) return;
    const pop = ref.current.querySelector('.dp-popover') as HTMLElement | null;
    if (!pop) return;
    const rect = pop.getBoundingClientRect();
    if (rect.right > window.innerWidth - 8) {
      pop.style.left = 'auto';
      pop.style.right = '0';
    }
    if (rect.bottom > window.innerHeight - 8) {
      pop.style.top = 'auto';
      pop.style.bottom = '100%';
    }
  }, [open]);

  const weekStart = getWeekStart(locale);
  const offset = getMonthOffset(viewYear, viewMonth, weekStart);
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const weekdays = weekdayNames(locale, weekStart);

  const minParsed = min ? parseYMD(min) : null;
  const isDisabled = (y: number, m: number, d: number): boolean => {
    if (!minParsed) return false;
    if (y !== minParsed.y) return y < minParsed.y;
    if (m !== minParsed.m) return m < minParsed.m;
    return d < minParsed.d;
  };

  const { y: selY, m: selM, d: selD } = parseYMD(value);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const selectDay = (d: number) => {
    const ymd = toYMD(viewYear, viewMonth, d);
    onChange(ymd);
    setOpen(false);
  };

  const displayValue = new Date(selY, selM, selD)
    .toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });

  const totalCells = Math.ceil((offset + daysInMonth) / 7) * 7;

  return (
    <div className="dp-wrapper" ref={ref}>
      <label className="dp-label">{label}</label>
      <button
        type="button"
        className="dp-trigger"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        {displayValue}
        <span className="dp-trigger-icon">▾</span>
      </button>

      {open && (
        <div className="dp-popover">
          <div className="dp-header">
            <button type="button" className="dp-nav" onClick={prevMonth} title={t.prevMonth}>
              {t.prevMonth}
            </button>
            <span className="dp-month-label">{monthName(viewYear, viewMonth, locale)}</span>
            <button type="button" className="dp-nav" onClick={nextMonth} title={t.nextMonth}>
              {t.nextMonth}
            </button>
          </div>

          <div className="dp-grid">
            {weekdays.map(wd => (
              <div key={wd} className="dp-weekday">{wd}</div>
            ))}
            {Array.from({ length: totalCells }, (_, i) => {
              const day = i - offset + 1;
              const inMonth = day >= 1 && day <= daysInMonth;
              const disabled = inMonth && isDisabled(viewYear, viewMonth, day);
              const selected = inMonth && day === selD && viewMonth === selM && viewYear === selY;
              const today = (() => {
                const t = new Date();
                return inMonth && day === t.getDate() && viewMonth === t.getMonth() && viewYear === t.getFullYear();
              })();
              return (
                <button
                  key={i}
                  type="button"
                  className={[
                    'dp-day',
                    !inMonth ? 'dp-day--empty' : '',
                    disabled ? 'dp-day--disabled' : '',
                    selected ? 'dp-day--selected' : '',
                    today && !selected ? 'dp-day--today' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => inMonth && !disabled && selectDay(day)}
                  tabIndex={inMonth && !disabled ? 0 : -1}
                >
                  {inMonth ? day : ''}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
