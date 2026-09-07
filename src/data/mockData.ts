import type { DiaryEntry, BucketItem, CalendarEvent } from '../types';

// Helper to format Date as "YYYY-MM-DD"
export function formatDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const now = new Date();
const todayKey = formatDateKey(now);

const tomorrow = new Date(now);
tomorrow.setDate(now.getDate() + 1);
const tomorrowKey = formatDateKey(tomorrow);

const yesterday = new Date(now);
yesterday.setDate(now.getDate() - 1);
const yesterdayKey = formatDateKey(yesterday);

const twoDaysAgo = new Date(now);
twoDaysAgo.setDate(now.getDate() - 2);
const twoDaysAgoKey = formatDateKey(twoDaysAgo);

const fourDaysAgo = new Date(now);
fourDaysAgo.setDate(now.getDate() - 4);
const fourDaysAgoKey = formatDateKey(fourDaysAgo);

export const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: 'event-1',
    title: '홈카페 원두 정기 배송 확인',
    date: todayKey,
    time: '10:00',
    endTime: '10:30',
    location: '집',
    description: '케냐 원두 로스팅 상태 확인 및 필터 정리',
    color: '#D97757',
    isCompleted: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'event-2',
    title: '저녁 요가 및 스트레칭',
    date: todayKey,
    time: '19:30',
    endTime: '20:30',
    location: '요가원',
    description: '하루 피로를 풀고 차분하게 호흡하기',
    color: '#10B981',
    isCompleted: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'event-3',
    title: '주말 브런치 약속',
    date: tomorrowKey,
    time: '11:30',
    endTime: '13:00',
    location: '연남동 카페',
    description: '오랜만에 만나는 친구와 점심 식사',
    color: '#3B82F6',
    isCompleted: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'event-4',
    title: '제주 올레길 바닷길 코스 트레킹',
    date: twoDaysAgoKey,
    time: '09:00',
    endTime: '14:00',
    location: '제주시 애월읍',
    description: '카메라 챙겨서 바닷길 풍경 담기',
    color: '#8B5CF6',
    isCompleted: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

export const INITIAL_BUCKET_ITEMS: BucketItem[] = [
  {
    id: 'bucket-1',
    title: '제주 올레길 바닷길 코스 완주하기',
    category: 'travel',
    targetDate: '2026-09-30',
    isCompleted: true,
    completedAt: twoDaysAgoKey,
    notes: '바다를 따라 걷는 해안 코스 완주하기',
  },
  {
    id: 'bucket-2',
    title: '홈카페 라떼아트 연습하기',
    category: 'hobby',
    targetDate: '2026-10-15',
    isCompleted: true,
    completedAt: todayKey,
    notes: '하트 모양 라떼아트 만들어보기',
  },
  {
    id: 'bucket-3',
    title: '감사일기 30일 연속 작성하기',
    category: 'growth',
    targetDate: '2026-10-31',
    isCompleted: false,
    notes: '매일 저녁 잠들기 전 10분 기록하는 습관',
  },
  {
    id: 'bucket-4',
    title: '가족 저녁 식사 직접 대접하기',
    category: 'relationship',
    targetDate: '2026-11-20',
    isCompleted: false,
    notes: '좋아하는 메뉴로 직접 요리하기',
  },
  {
    id: 'bucket-5',
    title: '독서 노트 2권 작성하기',
    category: 'growth',
    targetDate: '2026-12-31',
    isCompleted: false,
    notes: '인상 깊은 문장과 생각을 함께 기록',
  },
];

export const INITIAL_DIARIES: DiaryEntry[] = [
  {
    id: 'diary-today',
    date: todayKey,
    sticker: 'cozy',
    gratitudeItems: [
      '아침 창가로 들어온 부드러운 햇살',
      '직접 내린 따뜻한 커피 한 잔',
      '차분하게 하루를 시작할 수 있었던 시간',
    ],
    content: '창가 테이블에서 커피를 마시며 오늘 일정을 차분하게 정리했다. 잔잔하게 흐르는 음악 덕분에 마음이 한결 편안해졌다.',
    photos: ['/photos/morning_coffee.jpg'],
    location: {
      address: '서울 종로구 삼청동',
    },
    weather: {
      temp: 24,
      condition: '맑음',
      icon: '☀️',
    },
    linkedBucketId: 'bucket-2',
    linkedBucketTitle: '홈카페 라떼아트 연습하기',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'diary-yesterday',
    date: yesterdayKey,
    sticker: 'peaceful',
    gratitudeItems: [
      '퇴근길에 스쳐 지나간 시원한 가을바람',
      '어려운 문제를 함께 풀어준 동료의 배려',
      '집에 돌아와 편안히 마신 따뜻한 보리차',
    ],
    content: '업무를 마치고 돌아오는 길에 공기를 마시니 한층 선선해진 가을 기운이 느껴졌다. 바쁜 하루 끝에 걷는 20분 산책이 좋은 쉼이 되었다.',
    photos: [],
    location: {
      address: '서울 마포구 연남동',
    },
    weather: {
      temp: 22,
      condition: '구름 조금',
      icon: '⛅',
    },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'diary-twodays',
    date: twoDaysAgoKey,
    sticker: 'proud',
    gratitudeItems: [
      '목표했던 해안 산책 코스 완주',
      '해 질 녘 바다의 아름다운 노을 풍경',
      '끝까지 건강하게 걸을 수 있었던 다리',
    ],
    content: '오랫동안 가보고 싶었던 바닷길 코스를 드디어 걸었다. 지는 노을이 바다에 비치는 모습을 보며 걸으니 피로가 가시는 기분이었다.',
    photos: ['/photos/sunset_walk.jpg'],
    location: {
      address: '제주시 애월읍',
    },
    weather: {
      temp: 23,
      condition: '맑음',
      icon: '☀️',
    },
    linkedBucketId: 'bucket-1',
    linkedBucketTitle: '제주 올레길 바닷길 코스 완주하기',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'diary-fourdays',
    date: fourDaysAgoKey,
    sticker: 'happy',
    gratitudeItems: [
      '오랜 친구와의 반가운 통화',
      '골목길에서 만난 순한 강아지',
      '정갈하고 맛있는 저녁 식사',
    ],
    content: '친구와 그간 있었던 일들을 나누며 한참을 이야기했다. 사소한 일상을 편하게 나눌 수 있는 사람이 있다는 것에 고마움을 느낀다.',
    photos: [],
    location: {
      address: '서울 서대문구 연희동',
    },
    weather: {
      temp: 25,
      condition: '맑음',
      icon: '☀️',
    },
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
];
