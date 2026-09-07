import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { DiaryEntry, CalendarEvent } from '../../types';
import { STICKERS } from '../../data/stickers';

interface MonthlyCalendarProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  diaries: DiaryEntry[];
  events: CalendarEvent[];
  onOpenWriteModal: (dateStr?: string) => void;
}

export const MonthlyCalendar: React.FC<MonthlyCalendarProps> = ({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onToday,
  selectedDate,
  onSelectDate,
  diaries = [],
  events = [],
  onOpenWriteModal,
}) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Map diaries by date "YYYY-MM-DD"
  const diaryByDate = useMemo(() => {
    const map = new Map<string, DiaryEntry>();
    (diaries || []).forEach((d) => map.set(d.date, d));
    return map;
  }, [diaries]);

  // Map events by date "YYYY-MM-DD"
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    (events || []).forEach((ev) => {
      const list = map.get(ev.date) || [];
      list.push(ev);
      map.set(ev.date, list);
    });
    return map;
  }, [events]);

  // Streak calculation
  const streak = useMemo(() => {
    let count = 0;
    const checkDate = new Date();
    while (true) {
      const y = checkDate.getFullYear();
      const m = String(checkDate.getMonth() + 1).padStart(2, '0');
      const d = String(checkDate.getDate()).padStart(2, '0');
      const key = `${y}-${m}-${d}`;
      if (diaryByDate.has(key)) {
        count++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        if (count === 0) {
          checkDate.setDate(checkDate.getDate() - 1);
          const y2 = checkDate.getFullYear();
          const m2 = String(checkDate.getMonth() + 1).padStart(2, '0');
          const d2 = String(checkDate.getDate()).padStart(2, '0');
          if (diaryByDate.has(`${y2}-${m2}-${d2}`)) {
            count++;
            checkDate.setDate(checkDate.getDate() - 1);
            continue;
          }
        }
        break;
      }
    }
    return count;
  }, [diaryByDate]);

  // Calendar days generation
  const calendarCells = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const totalDays = new Date(year, month + 1, 0).getDate();

    const cells: Array<{
      type: 'empty' | 'day';
      day?: number;
      dateKey?: string;
      isToday?: boolean;
      diary?: DiaryEntry;
      dayEvents?: CalendarEvent[];
    }> = [];

    // Empty cells before 1st of month
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({ type: 'empty' });
    }

    const today = new Date();
    const todayY = today.getFullYear();
    const todayM = today.getMonth();
    const todayD = today.getDate();

    for (let day = 1; day <= totalDays; day++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = year === todayY && month === todayM && day === todayD;
      const diary = diaryByDate.get(dateKey);
      const dayEvents = eventsByDate.get(dateKey) || [];

      cells.push({
        type: 'day',
        day,
        dateKey,
        isToday,
        diary,
        dayEvents,
      });
    }

    return cells;
  }, [year, month, diaryByDate, eventsByDate]);

  const monthNameKo = `${year}년 ${month + 1}월`;
  const monthDiariesCount = diaries.filter((d) =>
    d.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)
  ).length;

  return (
    <div className="calendar-card">
      <div className="calendar-header">
        <div className="calendar-title-wrap">
          <h2 className="calendar-month-title">{monthNameKo}</h2>
          <span className="calendar-sub-stat">
            감사 {monthDiariesCount}일
          </span>
        </div>

        <div className="calendar-nav-buttons">
          {streak > 0 && (
            <div className="streak-badge-mini" title={`연속 ${streak}일 작성 중`}>
              <span className="streak-clover">☘️</span>
              <span>{streak}일</span>
            </div>
          )}
          <button className="today-btn" onClick={onToday} type="button">
            오늘
          </button>
          <button className="icon-btn-sm" onClick={onPrevMonth} title="이전 달" type="button" aria-label="이전 달">
            <ChevronLeft size={16} />
          </button>
          <button className="icon-btn-sm" onClick={onNextMonth} title="다음 달" type="button" aria-label="다음 달">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="calendar-grid-header">
        <div className="calendar-day-name sunday">일</div>
        <div className="calendar-day-name">월</div>
        <div className="calendar-day-name">화</div>
        <div className="calendar-day-name">수</div>
        <div className="calendar-day-name">목</div>
        <div className="calendar-day-name">금</div>
        <div className="calendar-day-name saturday">토</div>
      </div>

      <div className="calendar-grid">
        {calendarCells.map((cell, idx) => {
          if (cell.type === 'empty') {
            return <div key={`empty-${idx}`} className="calendar-cell is-empty" />;
          }

          const isSelected = selectedDate === cell.dateKey;
          const stickerObj = cell.diary ? STICKERS[cell.diary.sticker] : null;
          const dayEvents = cell.dayEvents || [];
          const firstEvent = dayEvents[0];

          return (
            <div
              key={cell.dateKey}
              className={`calendar-cell ${cell.isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''}`}
              onClick={() => {
                if (cell.dateKey) {
                  onSelectDate(cell.dateKey);
                }
              }}
              onDoubleClick={() => {
                if (cell.dateKey && !cell.diary) {
                  onOpenWriteModal(cell.dateKey);
                }
              }}
            >
              {/* Top: Date Number & Photo Indicator */}
              <div className="calendar-cell-top">
                <span className="calendar-date-num">{cell.day}</span>
                {cell.diary?.photos && cell.diary.photos.length > 0 ? (
                  <span className="cell-badge-dot" title="사진 첨부됨" />
                ) : (
                  <span className="cell-badge-spacer" />
                )}
              </div>

              {/* Middle: Gratitude Sticker (Visual Centerpiece) */}
              <div className="calendar-cell-middle">
                {stickerObj ? (
                  <span className="calendar-sticker" role="img" aria-label={stickerObj.label}>
                    {stickerObj.emoji}
                  </span>
                ) : (
                  <div className="calendar-sticker-placeholder" />
                )}
              </div>

              {/* Bottom: Warm Schedule Event Chip (Fixed height across all tiles) */}
              <div className="calendar-cell-bottom">
                {firstEvent ? (
                  <div
                    className={`calendar-event-chip ${firstEvent.isCompleted ? 'is-completed' : ''} ${firstEvent.isGoogleSynced ? 'is-gcal' : ''}`}
                    title={`${firstEvent.title}${firstEvent.time ? ` (${firstEvent.time})` : ''}${firstEvent.isGoogleSynced ? ' · 구글 캘린더 연동됨' : ''}`}
                  >
                    <span
                      className="event-chip-dot"
                      style={{ backgroundColor: firstEvent.color || 'var(--accent-primary)' }}
                    />
                    <span className="event-chip-text">{firstEvent.title}</span>
                    {dayEvents.length > 1 && (
                      <span className="event-chip-more">+{dayEvents.length - 1}</span>
                    )}
                  </div>
                ) : (
                  <div className="calendar-event-spacer" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
