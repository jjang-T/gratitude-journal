export type StickerId =
  | 'grateful'   // 따뜻한 감사
  | 'happy'      // 기쁜 순간
  | 'peaceful'   // 평온한 시간
  | 'cozy'       // 아늑한 휴식
  | 'excited'    // 설렘
  | 'love'       // 온기
  | 'proud'      // 성취
  | 'growth'     // 배움과 성장
  | 'nature'     // 맑은 날
  | 'special';   // 특별한 날

export interface Sticker {
  id: StickerId;
  emoji: string;
  label: string;
  desc: string;
  color: string;
  bgColor: string;
}

export interface DiaryLocation {
  address: string;
  latitude?: number;
  longitude?: number;
}

export interface DiaryWeather {
  temp?: number;
  condition: string;
  icon?: string;
}

export interface DiaryEntry {
  id: string;
  date: string;              // "YYYY-MM-DD"
  sticker: StickerId;
  gratitudeItems: string[];  // 감사 항목 리스트
  content: string;           // 상세 회고 본문
  photos: string[];          // 첨부 사진 URL / base64 배열
  location?: DiaryLocation;  // 작성 위치
  weather?: DiaryWeather;    // 작성 시점 날씨
  linkedBucketId?: string;   // 연계 버킷리스트 ID
  linkedBucketTitle?: string;// 연계 버킷리스트 제목
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;              // "YYYY-MM-DD"
  time?: string;             // "HH:mm" (없으면 종일 일정)
  endTime?: string;          // "HH:mm"
  location?: string;         // 장소
  description?: string;      // 상세 메모
  color: string;             // 일정 태그 색상 (#3B82F6, #D97757 등)
  isCompleted: boolean;      // 완료 여부
  isGoogleSynced?: boolean;  // 구글 캘린더 연동 여부
  createdAt: string;
}

export type BucketCategory = 'travel' | 'growth' | 'health' | 'hobby' | 'relationship' | 'life';

export interface BucketItem {
  id: string;
  title: string;
  category: BucketCategory;
  targetDate?: string;
  isCompleted: boolean;
  completedAt?: string;
  achievementDiaryId?: string;
  notes?: string;
}

export interface SupabaseSettings {
  supabaseUrl: string;
  supabaseAnonKey: string;
  syncEnabled: boolean;
  lastSyncedAt?: string;
}

export type ActiveTab = 'calendar' | 'feed' | 'bucket' | 'settings';
