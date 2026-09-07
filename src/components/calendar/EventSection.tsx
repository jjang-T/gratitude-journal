import React from 'react';
import { Plus, Check, Clock, MapPin, ExternalLink, Edit2, Trash2, Calendar as CalendarIcon, Download } from 'lucide-react';
import type { CalendarEvent } from '../../types';
import { openInGoogleCalendar, exportEventsToIcs } from '../../lib/gcalendar';

interface EventSectionProps {
  selectedDate: string;
  events: CalendarEvent[];
  allEvents: CalendarEvent[];
  onOpenAddEventModal: () => void;
  onEditEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onSyncGoogle?: (id: string) => void;
}

export const EventSection: React.FC<EventSectionProps> = ({
  selectedDate,
  events,
  allEvents,
  onOpenAddEventModal,
  onEditEvent,
  onDeleteEvent,
  onToggleComplete,
  onSyncGoogle,
}) => {
  return (
    <div className="event-section-card">
      <div className="event-section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CalendarIcon size={17} color="var(--accent-primary)" />
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              일정 ({events.length}개)
            </h4>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>{selectedDate}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            className="icon-btn"
            onClick={() => exportEventsToIcs(allEvents)}
            title="모든 일정 .ics 내보내기 (구글·애플 캘린더 동기화)"
            style={{ width: '30px', height: '30px' }}
          >
            <Download size={14} />
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={onOpenAddEventModal}
            style={{ padding: '5px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Plus size={14} />
            <span>일정 추가</span>
          </button>
        </div>
      </div>

      <div className="event-list">
        {events.length === 0 ? (
          <div className="event-empty-box">
            <p style={{ fontSize: '0.86rem', color: 'var(--text-tertiary)', margin: 0 }}>
              등록된 일정이 없습니다.
            </p>
          </div>
        ) : (
          events.map((ev) => (
            <div
              key={ev.id}
              className={`event-item-card ${ev.isCompleted ? 'is-completed' : ''}`}
              style={{ borderLeftColor: ev.color }}
            >
              <button
                type="button"
                className={`event-check-btn ${ev.isCompleted ? 'checked' : ''}`}
                onClick={() => onToggleComplete(ev.id)}
                title={ev.isCompleted ? '완료 취소' : '완료 처리'}
              >
                {ev.isCompleted && <Check size={13} strokeWidth={3} />}
              </button>

              <div className="event-item-body">
                <div className="event-item-title-row">
                  <span className="event-item-title">{ev.title}</span>
                  {ev.time ? (
                    <span className="event-time-badge">
                      <Clock size={11} />
                      <span>
                        {ev.time}
                        {ev.endTime ? ` - ${ev.endTime}` : ''}
                      </span>
                    </span>
                  ) : (
                    <span className="event-allday-badge">종일</span>
                  )}
                </div>

                {ev.location && (
                  <div className="event-meta-text">
                    <MapPin size={12} />
                    <span>{ev.location}</span>
                  </div>
                )}

                {ev.description && (
                  <div className="event-desc-text">{ev.description}</div>
                )}
              </div>

              <div className="event-actions">
                {ev.isGoogleSynced ? (
                  <div className="gcal-synced-pill" title="구글 캘린더에 연동된 일정입니다">
                    <span className="gcal-pill-check">
                      <Check size={10} strokeWidth={3} />
                    </span>
                    <span className="gcal-pill-label">구글 캘린더</span>
                    <button
                      type="button"
                      className="gcal-pill-open"
                      onClick={() => openInGoogleCalendar(ev)}
                      title="구글 캘린더에서 열기"
                    >
                      <ExternalLink size={10} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn-gcal-sync"
                    onClick={() => {
                      openInGoogleCalendar(ev);
                      onSyncGoogle?.(ev.id);
                    }}
                    title="구글 캘린더에 일정 등록하기"
                  >
                    <CalendarIcon size={12} />
                    <span>구글 캘린더</span>
                  </button>
                )}

                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => onEditEvent(ev)}
                  title="일정 수정"
                  style={{ width: '28px', height: '28px' }}
                >
                  <Edit2 size={13} />
                </button>

                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => {
                    if (confirm(`'${ev.title}' 일정을 삭제하시겠습니까?`)) {
                      onDeleteEvent(ev.id);
                    }
                  }}
                  title="일정 삭제"
                  style={{ width: '28px', height: '28px', color: 'var(--color-danger)' }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
