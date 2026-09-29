// Vercel Serverless Function: /api/bookings
// 제주 희스테이 실시간 예약 데이터 동기화 API

// 인메모리 캐시 (서버리스 인스턴스 간 빠른 공유)
let memoryCache = [
  '2026-10-02', '2026-10-03', '2026-10-04',
  '2026-10-15', '2026-10-16', '2026-10-17'
];

export default async function handler(req, res) {
  // CORS 헤더 설정 (모든 기기 및 도메인 접속 허용)
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 1. GET: 현재 예약된 날짜 목록 조회
  if (req.method === 'GET') {
    // Vercel KV 또는 외부 스토리지 환경변수가 있을 경우 우선 조회
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const kvRes = await fetch(`${process.env.KV_REST_API_URL}/get/booked_dates`, {
          headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` }
        });
        const kvData = await kvRes.json();
        if (kvData && kvData.result) {
          const parsed = typeof kvData.result === 'string' ? JSON.parse(kvData.result) : kvData.result;
          return res.status(200).json({ success: true, bookedDates: parsed, source: 'kv' });
        }
      } catch (e) {
        console.error('KV fetch error:', e);
      }
    }

    return res.status(200).json({ success: true, bookedDates: memoryCache, source: 'cache' });
  }

  // 2. POST: 관리자(1316)가 예약 날짜를 수정하여 저장
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

      // Vercel KV가 설정되어 있다면 영구 저장
      if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        try {
          await fetch(`${process.env.KV_REST_API_URL}/set/booked_dates`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
            body: JSON.stringify(bookedDates)
          });
        } catch (kvErr) {
          console.error('KV save error:', kvErr);
        }
      }

      return res.status(200).json({ success: true, message: '예약 일정이 성공적으로 저장되었습니다.', count: bookedDates.length });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  res.status(405).json({ message: 'Method Not Allowed' });
}
