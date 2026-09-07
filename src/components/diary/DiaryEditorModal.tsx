import React, { useState, useRef } from 'react';
import { X, Plus, Trash2, Image, Check, Trophy, MapPin, CloudSun, Loader2 } from 'lucide-react';
import type { DiaryEntry, StickerId, BucketItem } from '../../types';
import { STICKER_LIST, STICKERS } from '../../data/stickers';
import { fetchCurrentLocationAndWeather } from '../../lib/weather';

interface DiaryEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  initialDate?: string;
  existingEntry?: DiaryEntry | null;
  bucketItems?: BucketItem[];
  preselectedBucketId?: string;
}

export const DiaryEditorModal: React.FC<DiaryEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialDate,
  existingEntry,
  bucketItems = [],
  preselectedBucketId,
}) => {
  if (!isOpen) return null;

  const defaultDate = initialDate || new Date().toISOString().split('T')[0];

  // Form states
  const [date, setDate] = useState<string>(existingEntry?.date || defaultDate);
  const [selectedSticker, setSelectedSticker] = useState<StickerId>(
    existingEntry?.sticker || (preselectedBucketId ? 'proud' : 'grateful')
  );
  const [gratitudeItems, setGratitudeItems] = useState<string[]>(
    existingEntry?.gratitudeItems && existingEntry.gratitudeItems.length > 0
      ? existingEntry.gratitudeItems
      : ['', '', '']
  );
  const [content, setContent] = useState(existingEntry?.content || '');
  const [photos, setPhotos] = useState<string[]>(existingEntry?.photos || []);
  const [linkedBucketId, setLinkedBucketId] = useState<string>(
    existingEntry?.linkedBucketId || preselectedBucketId || ''
  );

  // Location and Weather states
  const [locationAddress, setLocationAddress] = useState(existingEntry?.location?.address || '');
  const [weatherCondition, setWeatherCondition] = useState(existingEntry?.weather?.condition || '');
  const [weatherTemp, setWeatherTemp] = useState<string>(
    existingEntry?.weather?.temp !== undefined ? String(existingEntry.weather.temp) : ''
  );
  const [weatherIcon, setWeatherIcon] = useState(existingEntry?.weather?.icon || '☀️');
  const [isLocating, setIsLocating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch location and weather
  const handleFetchLocation = async () => {
    setIsLocating(true);
    try {
      const data = await fetchCurrentLocationAndWeather();
      setLocationAddress(data.location.address);
      setWeatherCondition(data.weather.condition);
      setWeatherTemp(data.weather.temp !== undefined ? String(data.weather.temp) : '');
      setWeatherIcon(data.weather.icon || '☀️');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      alert(message || '위치 및 날씨 정보를 불러오지 못했습니다.');
    } finally {
      setIsLocating(false);
    }
  };

  // Gratitude items handlers
  const handleGratitudeChange = (index: number, value: string) => {
    const updated = [...gratitudeItems];
    updated[index] = value;
    setGratitudeItems(updated);
  };

  const handleAddGratitude = () => {
    setGratitudeItems([...gratitudeItems, '']);
  };

  const handleRemoveGratitude = (index: number) => {
    if (gratitudeItems.length <= 1) {
      setGratitudeItems(['']);
      return;
    }
    setGratitudeItems(gratitudeItems.filter((_, i) => i !== index));
  };

  // Photo upload handling
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          setPhotos((prev) => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanedGratitudes = gratitudeItems.map((item) => item.trim()).filter(Boolean);
    if (cleanedGratitudes.length === 0) {
      alert('감사 항목을 1개 이상 작성해주세요.');
      return;
    }

    const linkedBucket = bucketItems.find((b) => b.id === linkedBucketId);

    const locationObj = locationAddress.trim()
      ? { address: locationAddress.trim() }
      : undefined;

    const weatherObj = weatherCondition.trim()
      ? {
          condition: weatherCondition.trim(),
          temp: weatherTemp ? Number(weatherTemp) : undefined,
          icon: weatherIcon,
        }
      : undefined;

    onSave({
      id: existingEntry?.id,
      date: date || new Date().toISOString().split('T')[0],
      sticker: selectedSticker,
      gratitudeItems: cleanedGratitudes,
      content: content.trim(),
      photos,
      location: locationObj,
      weather: weatherObj,
      linkedBucketId: linkedBucketId || undefined,
      linkedBucketTitle: linkedBucket ? linkedBucket.title : undefined,
    });

    onClose();
  };

  const gratitudePlaceholders = [
    '오늘 감사했던 일이나 순간',
    '마음이 편안해졌던 시간',
    '주변 사람에게서 받은 도움이나 배려',
    '맛있게 먹은 식사나 차 한 잔',
    '스스로 잘 실천한 일',
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.25rem' }}>{STICKERS[selectedSticker].emoji}</span>
            <h3 className="modal-title">
              {existingEntry ? '감사일기 수정' : '감사일기 작성'}
            </h3>
          </div>
          <button className="icon-btn" onClick={onClose} type="button" aria-label="닫기">
            <X size={18} />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleFormSubmit}>
          <div className="modal-body">
            {/* Date and Location/Weather fetch bar */}
            <div className="form-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label className="form-label" style={{ margin: 0 }}>날짜 및 위치·날씨</label>
                <button
                  type="button"
                  className="btn-fetch-location"
                  onClick={handleFetchLocation}
                  disabled={isLocating}
                >
                  {isLocating ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>위치 확인 중...</span>
                    </>
                  ) : (
                    <>
                      <MapPin size={13} />
                      <span>현재 위치·날씨 불러오기</span>
                    </>
                  )}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                <input
                  type="date"
                  className="form-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />

                <div className="location-weather-row">
                  <div className="input-with-icon">
                    <span className="input-icon-prefix">
                      <MapPin size={15} />
                    </span>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="작성 장소 (예: 서울 종로구)"
                      value={locationAddress}
                      onChange={(e) => setLocationAddress(e.target.value)}
                    />
                  </div>

                  <div className="input-with-icon">
                    <span className="input-icon-prefix">
                      <CloudSun size={15} />
                    </span>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="날씨 (예: 맑음 24°C)"
                      value={weatherCondition ? `${weatherIcon} ${weatherCondition}${weatherTemp ? ` ${weatherTemp}°C` : ''}` : ''}
                      onChange={(e) => setWeatherCondition(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sticker / Mood selector */}
            <div className="form-group">
              <label className="form-label">
                <span>오늘의 기분 스티커</span>
              </label>
              <div className="sticker-picker-grid">
                {STICKER_LIST.map((sticker) => {
                  const isSelected = selectedSticker === sticker.id;
                  return (
                    <button
                      key={sticker.id}
                      type="button"
                      className={`sticker-pick-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedSticker(sticker.id)}
                      style={{
                        borderColor: isSelected ? sticker.color : undefined,
                        backgroundColor: isSelected ? sticker.bgColor : undefined,
                      }}
                    >
                      <span className="sticker-pick-emoji">{sticker.emoji}</span>
                      <span className="sticker-pick-label" style={{ color: isSelected ? sticker.color : undefined }}>
                        {sticker.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Gratitude Items */}
            <div className="form-group">
              <label className="form-label">
                <span>오늘 감사했던 일</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                  고마웠던 순간들을 적어보세요
                </span>
              </label>

              <div className="gratitude-input-list">
                {gratitudeItems.map((item, index) => (
                  <div key={index} className="gratitude-input-row">
                    <span className="gratitude-item-num">{index + 1}</span>
                    <input
                      type="text"
                      className="form-input"
                      value={item}
                      placeholder={gratitudePlaceholders[index % gratitudePlaceholders.length]}
                      onChange={(e) => handleGratitudeChange(index, e.target.value)}
                      required={index === 0}
                    />
                    {gratitudeItems.length > 1 && (
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => handleRemoveGratitude(index)}
                        title="삭제"
                        style={{ color: 'var(--color-danger)', border: 'none', background: 'transparent' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="btn-add-gratitude"
                onClick={handleAddGratitude}
              >
                <Plus size={15} /> 감사 항목 추가
              </button>
            </div>

            {/* Journal Content Textarea */}
            <div className="form-group">
              <label className="form-label">
                생각 및 메모 (선택)
              </label>
              <textarea
                className="form-textarea"
                placeholder="오늘 하루에 대해 덧붙이고 싶은 생각이나 느낌을 적어보세요."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
              />
            </div>

            {/* Photo Attachment */}
            <div className="form-group">
              <label className="form-label">사진 첨부 (선택)</label>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
              />

              <div
                className="photo-upload-zone"
                onClick={() => fileInputRef.current?.click()}
              >
                <Image size={22} color="var(--accent-primary)" />
                <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  사진 첨부하기
                </span>
              </div>

              {photos.length > 0 && (
                <div className="photo-previews">
                  {photos.map((photoUrl, idx) => (
                    <div key={idx} className="photo-preview-item">
                      <img src={photoUrl} alt={`첨부사진 ${idx + 1}`} className="photo-preview-img" />
                      <button
                        type="button"
                        className="photo-remove-btn"
                        onClick={() => handleRemovePhoto(idx)}
                        title="사진 삭제"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bucket list linkage */}
            {bucketItems.length > 0 && (
              <div className="form-group">
                <label className="form-label">
                  <span>버킷리스트 연계 (선택)</span>
                  <Trophy size={14} color="#D97757" />
                </label>
                <select
                  className="form-select"
                  value={linkedBucketId}
                  onChange={(e) => setLinkedBucketId(e.target.value)}
                >
                  <option value="">연계 없음</option>
                  {bucketItems.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.isCompleted ? '[완료] ' : ''}{b.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn-primary">
              <Check size={16} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }} />
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
