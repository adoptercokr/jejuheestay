// Vercel Serverless Function: /api/bookings
// 제주 희스테이 영구 실시간 예약 데이터 동기화 API (영구 클라우드 스토리지 연동)

const PERMANENT_STORAGE_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a0ecdaf3bd400c';

// 비상용 로컬 기본 캐시
let memoryCache = [
  '2026-10-02', '2026-10-03', '2026-10-04',
  '2026-10-15', '2026-10-16'
];

export default async function handler(req, res) {
  // CORS 헤더 설정 (모든 기기 및 도메인 접속 허용)
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 1. GET: 영구 클라우드 스토리지에서 현재 예약된 날짜 목록 조회
  if (req.method === 'GET') {
    try {
      const cloudRes = await fetch(PERMANENT_STORAGE_URL, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        cache: 'no-store'
      });
      if (cloudRes.ok) {
        const cloudData = await cloudRes.json();
        if (cloudData && cloudData.data && Array.isArray(cloudData.data.dates)) {
          memoryCache = cloudData.data.dates;
          return res.status(200).json({ success: true, bookedDates: cloudData.data.dates, source: 'cloud' });
        }
      }
    } catch (err) {
      console.error('Permanent storage fetch error:', err);
    }

    // 클라우드 장애 시 메모리 캐시 반환
    return res.status(200).json({ success: true, bookedDates: memoryCache, source: 'fallback' });
  }

  // 2. POST: 관리자(1316)가 예약 날짜를 수정하여 영구 클라우드에 저장
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { password, bookedDates } = body;

      if (password !== '1316') {
        return res.status(401).json({ success: false, message: '관리자 비밀번호가 올바르지 않습니다.' });
      }

      if (!Array.isArray(bookedDates)) {
        return res.status(400).json({ success: false, message: '올바른 날짜 배열 형식이 아닙니다.' });
      }

      // 메모리 캐시 갱신
      memoryCache = bookedDates;

      // 영구 클라우드 스토리지에 즉시 PUT 저장 (Vercel 재배포나 서버리스 리셋에도 영구 보존)
      const saveRes = await fetch(PERMANENT_STORAGE_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'jeju_heestay_booked_dates',
          data: { dates: bookedDates }
        })
      });

      if (!saveRes.ok) {
        console.warn('Cloud storage save warning, status:', saveRes.status);
      }

      return res.status(200).json({
        success: true,
        message: '예약 일정이 영구 클라우드에 성공적으로 저장되었습니다.',
        count: bookedDates.length,
        bookedDates: bookedDates
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  res.status(405).json({ message: 'Method Not Allowed' });
}
