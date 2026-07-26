import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, X, Check } from 'lucide-react';

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
  const [activePreset, setActivePreset] = useState<string>('custom');

  useEffect(() => {
    if (isOpen) {
      const s = startDate ? new Date(startDate) : new Date(today.getFullYear(), today.getMonth(), 1);
      const e = endDate ? new Date(endDate) : today;
      setSelectedStart(isNaN(s.getTime()) ? null : s);
      setSelectedEnd(isNaN(e.getTime()) ? null : e);
      if (!isNaN(s.getTime())) {
        setCurrentMonth(new Date(s.getFullYear(), s.getMonth(), 1));
      }
    }
  }, [isOpen, startDate, endDate]);

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
    setActivePreset('custom');
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
    if (!d) return 'Select date';
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handlePreset = (preset: string) => {
    setActivePreset(preset);
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
      const finalEnd = selectedEnd ? formatISO(selectedEnd) : finalStart;
      onApply(finalStart, finalEnd);
      onClose();
    }
  };

  const presetsList = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: '7days', label: 'Last 7 Days' },
    { id: '30days', label: 'Last 30 Days' },
    { id: 'thisMonth', label: 'This Month' },
    { id: 'lastMonth', label: 'Last Month' },
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.55)',
      backdropFilter: 'blur(6px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '560px',
        padding: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e2e8f0'
      }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              backgroundColor: '#e6f4ea',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CalendarIcon size={22} color="#0d5c3a" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>Select Custom Date Range</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>Filter analytics by specific start and end dates</p>
            </div>
          </div>
          <button 
            type="button"
            className="calendar-modal-btn"
            onClick={onClose}
            style={{
              backgroundColor: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '50%',
              width: 34,
              height: 34,
              padding: 0,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0f172a',
              transition: 'all 0.15s ease'
            }}
          >
            <X size={18} style={{ stroke: '#0f172a', color: '#0f172a', strokeWidth: 2.5 }} />
          </button>
        </div>

        {/* Sidebar + Calendar Body Container */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          {/* Left Sidebar: Quick Presets */}
          <div style={{
            width: '140px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            borderRight: '1px solid #f1f5f9',
            paddingRight: '16px'
          }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
              PRESETS
            </span>
            {presetsList.map(p => {
              const isActive = activePreset === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePreset(p.id)}
                  style={{
                    textAlign: 'left',
                    padding: '8px 12px',
                    fontSize: '0.82rem',
                    fontWeight: isActive ? 600 : 500,
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: isActive ? '#e6f4ea' : 'transparent',
                    color: isActive ? '#0d5c3a' : '#475569',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{p.label}</span>
                  {isActive && <Check size={14} style={{ stroke: '#0d5c3a', color: '#0d5c3a', strokeWidth: 2.5 }} />}
                </button>
              );
            })}
          </div>

          {/* Right Main Area: Calendar Grid */}
          <div style={{ flex: 1 }}>
            {/* Calendar Month Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a' }}>{monthName}</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button type="button" className="calendar-modal-btn" onClick={prevMonth} style={navBtnStyle} title="Previous Month">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: 'auto' }}>
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
                <button type="button" className="calendar-modal-btn" onClick={nextMonth} style={navBtnStyle} title="Next Month">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: 'auto' }}>
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>
            </div>

            {/* Weekday Labels */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '6px', textAlign: 'center' }}>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, idx) => (
                <div key={idx} style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', padding: '4px 0' }}>
                  {day}
                </div>
              ))}
            </div>

            {/* Days Matrix */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
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
                  fontWeight = '700';
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
                      height: '34px',
                      border: 'none',
                      backgroundColor: bg,
                      color: textColor,
                      fontSize: '0.83rem',
                      fontWeight,
                      borderRadius,
                      cursor: 'pointer',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.12s ease'
                    }}
                  >
                    {date.getDate()}
                    {todayMark && !isStart && !isEnd && (
                      <div style={{
                        position: 'absolute',
                        bottom: '3px',
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
          </div>
        </div>

        {/* Selection Summary Bar */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          padding: '12px 16px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          border: '1px solid #e2e8f0'
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              SELECTED RANGE
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
              {formatDisplay(selectedStart)} {selectedEnd ? `→ ${formatDisplay(selectedEnd)}` : ''}
            </div>
          </div>
          {selectedStart && selectedEnd && (
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#0d5c3a',
              backgroundColor: '#e6f4ea',
              padding: '6px 12px',
              borderRadius: '20px',
              border: '1px solid #b7e4c7'
            }}>
              {Math.max(1, Math.round((selectedEnd.getTime() - selectedStart.getTime()) / 86400000) + 1)} Days Selected
            </span>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#475569',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!selectedStart}
            style={{
              padding: '10px 24px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: selectedStart ? '#0d5c3a' : '#94a3b8',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: selectedStart ? 'pointer' : 'not-allowed',
              boxShadow: selectedStart ? '0 4px 12px rgba(13, 92, 58, 0.25)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Apply Range
          </button>
        </div>
      </div>
    </div>
  );
};

const navBtnStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  backgroundColor: '#f8fafc',
  color: '#0f172a',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.15s ease',
  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
};
