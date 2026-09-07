import React, { useState } from 'react';
import { X, Clock, MapPin, AlignLeft, Calendar as CalendarIcon, ExternalLink } from 'lucide-react';
import type { CalendarEvent } from '../../types';
import { EVENT_COLORS, openInGoogleCalendar } from '../../lib/gcalendar';

interface EventEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: Omit<CalendarEvent, 'id' | 'createdAt' | 'isCompleted'> & { id?: string }) => void;
  initialDate: string;
  existingEvent?: CalendarEvent | null;
}

export const EventEditorModal: React.FC<EventEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialDate,
  existingEvent,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState(existingEvent?.title || '');
  const [date, setDate] = useState(existingEvent?.date || initialDate);
  const [isAllDay, setIsAllDay] = useState(!existingEvent?.time);
  const [time, setTime] = useState(existingEvent?.time || '10:00');
  const [endTime, setEndTime] = useState(existingEvent?.endTime || '11:00');
  const [location, setLocation] = useState(existingEvent?.location || '');
  const [description, setDescription] = useState(existingEvent?.description || '');
  const [color, setColor] = useState(existingEvent?.color || EVENT_COLORS[0].id);
  const [openGoogleImmediately, setOpenGoogleImmediately] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('일정 제목을 입력해주세요.');
      return;
    }

    const eventPayload = {
      ...(existingEvent || {}),
      title: title.trim(),
      date,
      time: isAllDay ? undefined : time,
      endTime: isAllDay ? undefined : endTime,
      location: location.trim() || undefined,
      description: description.trim() || undefined,
      color,
      isCompleted: existingEvent ? existingEvent.isCompleted : false,
      isGoogleSynced: openGoogleImmediately ? true : (existingEvent?.isGoogleSynced || false),
    };

    onSave(eventPayload);

    if (openGoogleImmediately) {
      const fullEvent: CalendarEvent = {
        id: existingEvent?.id || 'temp',
        title: title.trim(),
        date,
        time: isAllDay ? undefined : time,
        endTime: isAllDay ? undefined : endTime,
        location: location.trim() || undefined,
        description: description.trim() || undefined,
        color,
        isCompleted: false,
        isGoogleSynced: true,
        createdAt: new Date().toISOString(),
      };
      openInGoogleCalendar(fullEvent);
    }

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarIcon size={18} color="var(--accent-primary)" />
            <h3 className="modal-title">
              {existingEvent ? '일정 수정' : '새 일정 등록'}
            </h3>
          </div>
          <button className="icon-btn" onClick={onClose} type="button" aria-label="닫기">
            <X size={18} />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Title */}
            <div className="form-group">
              <label className="form-label">일정 제목</label>
              <input
                type="text"
                className="form-input"
                placeholder="어떤 일정인가요? (예: 팀 미팅, 병원 예약, 생일 모임)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                required
              />
            </div>

            {/* Date and All-day toggle */}
            <div className="form-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label className="form-label" style={{ margin: 0 }}>일자</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  <input
                    type="checkbox"
                    checked={isAllDay}
                    onChange={(e) => setIsAllDay(e.target.checked)}
                  />
                  <span>종일 일정</span>
                </label>
              </div>

              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            {/* Time inputs if not all-day */}
            {!isAllDay && (
              <div className="form-group">
                <label className="form-label">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Clock size={14} /> 시간 설정
                  </span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: '4px' }}>
                      시작 시간
                    </span>
                    <input
                      type="time"
                      className="form-input"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: '4px' }}>
                      종료 시간 (선택)
                    </span>
                    <input
                      type="time"
                      className="form-input"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Location */}
            <div className="form-group">
              <label className="form-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <MapPin size={14} /> 장소 (선택)
                </span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="장소 또는 온라인 링크"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            {/* Color Tag */}
            <div className="form-group">
              <label className="form-label">색상 태그</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {EVENT_COLORS.map((c) => {
                  const isSelected = color === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setColor(c.id)}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: c.id,
                        border: isSelected ? '3px solid #292524' : '2px solid transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.15s ease',
                        transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                      }}
                      title={c.label}
                    />
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <AlignLeft size={14} /> 상세 내용 (선택)
                </span>
              </label>
              <textarea
                className="form-textarea"
                placeholder="일정에 필요한 준비물이나 메모를 남겨보세요."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Google Calendar option */}
            <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: 'var(--radius-md)', padding: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.86rem', color: '#0369A1', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={openGoogleImmediately}
                  onChange={(e) => setOpenGoogleImmediately(e.target.checked)}
                />
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  저장 후 구글 캘린더에도 바로 등록하기 <ExternalLink size={13} />
                </span>
              </label>
              <p style={{ fontSize: '0.78rem', color: '#0284C7', marginTop: '4px', marginLeft: '24px', lineHeight: 1.4 }}>
                체크하시면 저장을 누르는 즉시 구글 캘린더 새 일정 등록 창이 함께 열립니다.
              </p>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn-primary">
              {existingEvent ? '수정 완료' : '일정 저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
