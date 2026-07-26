import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DateRangeCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  onApply: (startDate: string, endDate: string) => void;
}

export const DateRangeCalendarModal: React.FC<DateRangeCalendarModalProps> = ({
  isOpen,
  onClose,
  startDate,
  endDate,
  onApply,
}) => {
  const today = new Date();
  const initialStart = startDate ? new Date(startDate) : new Date(today.getFullYear(), today.getMonth(), 1);
  const initialEnd = endDate ? new Date(endDate) : today;

  const [currentMonth, setCurrentMonth] = useState(new Date(initialStart.getFullYear(), initialStart.getMonth(), 1));
  const [selectedStart, setSelectedStart] = useState<Date | null>(isNaN(initialStart.getTime()) ? null : initialStart);
  const [selectedEnd, setSelectedEnd] = useState<Date | null>(isNaN(initialEnd.getTime()) ? null : initialEnd);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  if (!isOpen) return null;

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  const calendarCells: { date: Date; isCurrentMonth: boolean }[] = [];

  // Previous month padding
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    calendarCells.push({
      date: new Date(year, month - 1, daysInPrevMonth - i),
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push({
      date: new Date(year, month, d),
      isCurrentMonth: true,
    });
  }

  // Next month padding
  const remaining = 35 - calendarCells.length;
  const nextPadding = remaining < 0 ? 42 - calendarCells.length : remaining;
  for (let i = 1; i <= nextPadding; i++) {
    calendarCells.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false,
    });
  }

  const handleDateClick = (date: Date) => {
    if (!selectedStart || (selectedStart && selectedEnd)) {
      setSelectedStart(date);
      setSelectedEnd(null);
    } else {
      if (date < selectedStart) {
        setSelectedStart(date);
        setSelectedEnd(null);
      } else {
        setSelectedEnd(date);
      }
    }
  };

  const isSameDay = (d1: Date | null, d2: Date | null) => {
    if (!d1 || !d2) return false;
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const isToday = (d: Date) => {
    return isSameDay(d, today);
  };

  const isInRange = (d: Date) => {
    if (selectedStart && selectedEnd) {
      return d >= selectedStart && d <= selectedEnd;
    }
    if (selectedStart && hoverDate && !selectedEnd) {
      const start = selectedStart < hoverDate ? selectedStart : hoverDate;
      const end = selectedStart < hoverDate ? hoverDate : selectedStart;
      return d >= start && d <= end;
    }
    return false;
  };

  const formatISO = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const formatDisplay = (d: Date | null) => {
    if (!d) return '—';
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handlePreset = (preset: string) => {
    const now = new Date();
    let start: Date;
    let end: Date = now;

    if (preset === 'today') {
      start = now;
    } else if (preset === 'yesterday') {
      start = new Date(now.getTime() - 86400000);
      end = start;
    } else if (preset === '7days') {
      start = new Date(now.getTime() - 7 * 86400000);
    } else if (preset === '30days') {
      start = new Date(now.getTime() - 30 * 86400000);
    } else if (preset === 'thisMonth') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (preset === 'lastMonth') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
    } else {
      return;
    }

    setSelectedStart(start);
    setSelectedEnd(end);
    setCurrentMonth(new Date(start.getFullYear(), start.getMonth(), 1));
  };

  const handleApply = () => {
    if (selectedStart) {
      const finalStart = formatISO(selectedStart);
      const finalEnd = selectedEnd ? formatISO(selectedStart) : finalStart;
      onApply(finalStart, selectedEnd ? formatISO(selectedEnd) : finalStart);
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.5)',
      backdropFilter: 'blur(4px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '460px',
        padding: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #e2e8f0'
      }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              backgroundColor: '#e6f4ea',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CalendarIcon size={20} color="#0d5c3a" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#0f172a' }}>Select Custom Date Range</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Pick start and end dates</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Presets */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <button type="button" onClick={() => handlePreset('today')} style={presetBtnStyle}>Today</button>
          <button type="button" onClick={() => handlePreset('yesterday')} style={presetBtnStyle}>Yesterday</button>
          <button type="button" onClick={() => handlePreset('7days')} style={presetBtnStyle}>Last 7 Days</button>
          <button type="button" onClick={() => handlePreset('30days')} style={presetBtnStyle}>Last 30 Days</button>
          <button type="button" onClick={() => handlePreset('thisMonth')} style={presetBtnStyle}>This Month</button>
          <button type="button" onClick={() => handlePreset('lastMonth')} style={presetBtnStyle}>Last Month</button>
        </div>

        {/* Calendar Header: Month Prev/Next */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 4px' }}>
          <span style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>{monthName}</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" onClick={prevMonth} style={navBtnStyle} title="Previous Month">
              <ChevronLeft size={18} color="#334155" />
            </button>
            <button type="button" onClick={nextMonth} style={navBtnStyle} title="Next Month">
              <ChevronRight size={18} color="#334155" />
            </button>
          </div>
        </div>

        {/* Calendar Weekday Labels */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '8px', textAlign: 'center' }}>
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, idx) => (
            <div key={idx} style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', padding: '6px 0' }}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days Matrix */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '20px' }}>
          {calendarCells.map(({ date, isCurrentMonth }, idx) => {
            const isStart = isSameDay(date, selectedStart);
            const isEnd = isSameDay(date, selectedEnd);
            const inRange = isInRange(date);
            const todayMark = isToday(date);

            let bg = 'transparent';
            let textColor = isCurrentMonth ? '#1e293b' : '#cbd5e1';
            let borderRadius = '6px';
            let fontWeight = isCurrentMonth ? '500' : 'normal';

            if (isStart || isEnd) {
              bg = '#0d5c3a'; // Humal Green
              textColor = '#ffffff';
              fontWeight = 'bold';
              borderRadius = isStart && !selectedEnd ? '8px' : (isStart ? '8px 0 0 8px' : '0 8px 8px 0');
            } else if (inRange) {
              bg = '#e6f4ea'; // Soft green range fill
              textColor = '#0d5c3a';
              borderRadius = '0';
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleDateClick(date)}
                onMouseEnter={() => setHoverDate(date)}
                style={{
                  height: '38px',
                  border: 'none',
                  backgroundColor: bg,
                  color: textColor,
                  fontSize: '0.85rem',
                  fontWeight,
                  borderRadius,
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease'
                }}
              >
                {date.getDate()}
                {todayMark && !isStart && !isEnd && (
                  <div style={{
                    position: 'absolute',
                    bottom: '4px',
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    backgroundColor: '#0d5c3a'
                  }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Selection Summary Bar */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          padding: '10px 14px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          border: '1px solid #e2e8f0'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>SELECTED RANGE</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>
              {formatDisplay(selectedStart)} {selectedEnd ? `→ ${formatDisplay(selectedEnd)}` : ''}
            </div>
          </div>
          {selectedStart && selectedEnd && (
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0d5c3a', backgroundColor: '#e6f4ea', padding: '4px 8px', borderRadius: '12px' }}>
              {Math.max(1, Math.round((selectedEnd.getTime() - selectedStart.getTime()) / 86400000) + 1)} Days
            </span>
          )}
        </div>

        {/* Modal Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#475569',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!selectedStart}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: selectedStart ? '#0d5c3a' : '#94a3b8',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: selectedStart ? 'pointer' : 'not-allowed',
              boxShadow: selectedStart ? '0 4px 6px -1px rgba(13, 92, 58, 0.2)' : 'none'
            }}
          >
            Apply Range
          </button>
        </div>
      </div>
    </div>
  );
};

const presetBtnStyle: React.CSSProperties = {
  padding: '6px 12px',
  fontSize: '0.75rem',
  fontWeight: 500,
  borderRadius: '6px',
  border: '1px solid #e2e8f0',
  backgroundColor: '#f8fafc',
  color: '#334155',
  cursor: 'pointer',
  transition: 'all 0.15s ease'
};

const navBtnStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: '6px',
  border: '1px solid #cbd5e1',
  backgroundColor: '#ffffff',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
