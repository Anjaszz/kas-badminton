'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDateIndo } from '../lib/dataService';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  direction?: 'auto' | 'up' | 'down';
}

export default function DatePicker({
  value,
  onChange,
  label,
  placeholder = 'Pilih tanggal...',
  className = '',
  direction = 'auto',
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [placement, setPlacement] = useState<'down' | 'up'>('down');
  const containerRef = useRef<HTMLDivElement>(null);

  const [viewYear, setViewYear] = useState(() => {
    if (value && value.includes('-')) {
      const y = parseInt(value.split('-')[0], 10);
      if (!isNaN(y)) return y;
    }
    return 2026;
  });
  const [viewMonth, setViewMonth] = useState(() => {
    if (value && value.includes('-')) {
      const m = parseInt(value.split('-')[1], 10) - 1;
      if (!isNaN(m)) return m;
    }
    return 9;
  });
  const [todayInfo, setTodayInfo] = useState<{ y: number; m: number; d: number } | null>(null);

  useEffect(() => {
    const now = new Date();
    setTodayInfo({
      y: now.getFullYear(),
      m: now.getMonth(),
      d: now.getDate(),
    });

    if (value && value.includes('-')) {
      const parts = value.split('-');
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      if (!isNaN(y) && !isNaN(m)) {
        setViewYear(y);
        setViewMonth(m);
        return;
      }
    }
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      if (direction === 'up') {
        setPlacement('up');
        return;
      }
      if (direction === 'down') {
        setPlacement('down');
        return;
      }
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < 350) {
        setPlacement('up');
      } else {
        setPlacement('down');
      }
    }
  }, [isOpen, direction]);

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

  const handleSelectDate = (day: number) => {
    const formattedMonth = String(viewMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const selectedString = `${viewYear}-${formattedMonth}-${formattedDay}`;
    onChange(selectedString);
    setIsOpen(false);
  };

  const setQuickDate = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    onChange(`${y}-${m}-${day}`);
    setViewYear(y);
    setViewMonth(d.getMonth());
    setIsOpen(false);
  };

  const isToday = (day: number) => {
    if (!todayInfo) return false;
    return (
      todayInfo.y === viewYear &&
      todayInfo.m === viewMonth &&
      todayInfo.d === day
    );
  };

  const isSelected = (day: number) => {
    if (!value) return false;
    const [y, m, d] = value.split('-').map(Number);
    return y === viewYear && m === viewMonth + 1 && d === day;
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between bg-slate-50 dark:bg-[#0a0a0f] border border-slate-300 dark:border-zinc-700/80 hover:border-slate-400 dark:hover:border-zinc-500 rounded-xl px-3.5 py-2.5 text-sm text-left transition-all ${
          isOpen ? 'border-red-500 ring-1 ring-red-500/30' : ''
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <CalendarIcon className="w-4 h-4 text-slate-400 dark:text-zinc-400 flex-shrink-0" />
          <span className={value ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-400 dark:text-zinc-500'}>
            {value ? formatDateIndo(value) : placeholder}
          </span>
        </div>
        <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 bg-white dark:bg-zinc-800/80 px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-700">
          Pilih
        </span>
      </button>

      {/* Overlay Panel (Calendar Dropdown) */}
      {isOpen && (
        <div
          className={`absolute left-0 z-50 w-72 sm:w-80 max-w-[calc(100vw-2.5rem)] bg-white dark:bg-[#14141c] border border-slate-200 dark:border-[#2b2b3b] rounded-2xl p-3.5 sm:p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150 ${
            placement === 'up'
              ? 'bottom-full mb-2 shadow-[0_-12px_40px_rgba(15,23,42,0.18)] dark:shadow-[0_-12px_40px_rgba(0,0,0,0.9)]'
              : 'top-full mt-2 shadow-[0_12px_40px_rgba(15,23,42,0.18)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.9)]'
          }`}
        >
          
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800/70 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Bulan sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">
              {monthNames[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800/70 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Bulan berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {daysOfWeek.map((d, idx) => (
              <span
                key={d}
                className={`text-[11px] font-bold ${
                  idx === 0 ? 'text-red-500 dark:text-red-400' : 'text-slate-400 dark:text-zinc-500'
                }`}
              >
                {d}
              </span>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {Array.from({ length: firstDayIndex }).map((_, i) => {
              const dayNum = prevMonthDays - firstDayIndex + i + 1;
              return (
                <div
                  key={`prev-${i}`}
                  className="h-8 flex items-center justify-center text-xs text-slate-300 dark:text-zinc-600 select-none"
                >
                  {dayNum}
                </div>
              );
            })}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const selected = isSelected(day);
              const today = isToday(day);

              return (
                <button
                  type="button"
                  key={day}
                  onClick={() => handleSelectDate(day)}
                  className={`h-8 w-8 mx-auto rounded-xl flex items-center justify-center text-xs font-medium transition-all ${
                    selected
                      ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/30 dark:shadow-red-900/50 scale-105'
                      : today
                      ? 'bg-emerald-50 dark:bg-zinc-800 border border-emerald-500 text-emerald-700 dark:text-emerald-400 font-bold hover:bg-emerald-100 dark:hover:bg-zinc-700'
                      : 'text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Quick Shortcuts Footer */}
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => setQuickDate(-7)}
              className="text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              -1 Minggu
            </button>
            <button
              type="button"
              onClick={() => setQuickDate(-1)}
              className="text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Kemarin
            </button>
            <button
              type="button"
              onClick={() => setQuickDate(0)}
              className="text-emerald-600 dark:text-emerald-400 font-semibold hover:text-emerald-500 dark:hover:text-emerald-300 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Hari Ini
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
