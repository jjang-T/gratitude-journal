import type { DiaryLocation, DiaryWeather } from '../types';

export function getWeatherInfoByCode(code: number): { condition: string; icon: string } {
  switch (code) {
    case 0:
      return { condition: '맑음', icon: '☀️' };
    case 1:
      return { condition: '대체로 맑음', icon: '🌤️' };
    case 2:
      return { condition: '구름 조금', icon: '⛅' };
    case 3:
      return { condition: '흐림', icon: '☁️' };
    case 45:
    case 48:
      return { condition: '안개', icon: '🌫️' };
    case 51:
    case 53:
    case 55:
      return { condition: '이슬비', icon: '🌦️' };
    case 61:
    case 63:
    case 65:
      return { condition: '비', icon: '🌧️' };
    case 71:
    case 73:
    case 75:
    case 77:
      return { condition: '눈', icon: '❄️' };
    case 80:
    case 81:
    case 82:
      return { condition: '소나기', icon: '🌦️' };
    case 85:
    case 86:
      return { condition: '눈보라', icon: '🌨️' };
    case 95:
    case 96:
    case 99:
      return { condition: '뇌우', icon: '⛈️' };
    default:
      return { condition: '맑음', icon: '☀️' };
  }
}

export async function getCurrentCoordinates(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('이 브라우저는 위치 서비스를 지원하지 않습니다.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => {
        let msg = '위치 정보를 가져올 수 없습니다.';
        if (err.code === 1) msg = '위치 접근 권한이 거부되었습니다.';
        else if (err.code === 2) msg = '위치를 확인할 수 없습니다.';
        else if (err.code === 3) msg = '위치 요청 시간이 초과되었습니다.';
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000,
      }
    );
  });
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'ko',
          'User-Agent': 'HaruGratitudeJournalApp/1.0',
        },
      }
    );
    if (!res.ok) throw new Error('Geocode failed');
    const data = await res.json();
    const a = data.address || {};

    const city = a.city || a.province || a.state || '';
    const district = a.borough || a.suburb || a.city_district || a.county || '';
    const town = a.quarter || a.neighbourhood || a.village || a.town || '';

    const parts = [city, district, town].filter(Boolean);
    if (parts.length > 0) {
      return parts.join(' ');
    }
    return data.display_name?.split(',').slice(0, 2).join(' ') || `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
  } catch (e) {
    // Fallback simple coordinates representation
    return `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`;
  }
}

export async function fetchCurrentWeather(latitude: number, longitude: number): Promise<DiaryWeather> {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`
    );
    if (!res.ok) throw new Error('Weather API failed');
    const data = await res.json();
    const temp = Math.round(data.current?.temperature_2m ?? 20);
    const code = data.current?.weather_code ?? 0;
    const { condition, icon } = getWeatherInfoByCode(code);

    return {
      temp,
      condition,
      icon,
    };
  } catch (e) {
    return {
      condition: '맑음',
      icon: '☀️',
    };
  }
}

export async function fetchCurrentLocationAndWeather(): Promise<{
  location: DiaryLocation;
  weather: DiaryWeather;
}> {
  const coords = await getCurrentCoordinates();
  const [address, weather] = await Promise.all([
    reverseGeocode(coords.latitude, coords.longitude),
    fetchCurrentWeather(coords.latitude, coords.longitude),
  ]);

  return {
    location: {
      address,
      latitude: coords.latitude,
      longitude: coords.longitude,
    },
    weather,
  };
}
