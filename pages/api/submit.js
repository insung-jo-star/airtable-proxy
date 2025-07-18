// pages/api/submit.js

export default async function handler(req, res) {
  // CORS 허용 도메인
  const allowedOrigins = [
  "https://g-1-f29l.vercel.app",
  // 필요시 이전 도메인도 같이 넣어둬도 무방
];
  const requestOrigin = req.headers.origin;
console.log("requestOrigin:", requestOrigin);  // ← 대소문자 일치!
  
  if (allowedOrigins.includes(requestOrigin)) {
    res.setHeader("Access-Control-Allow-Origin", requestOrigin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigins[0]);
  }
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // --- 상담신청 맞춤 환경설정 (Base ID/테이블명 하드코딩) ---
  const API_KEY = process.env.AIRTABLE_API_KEY;    // .env에서 관리
  const BASE_ID = "appcVDsCi9Vei3UNk";             // 상담신청 Base ID
  const TABLE_NAME = "상담신청";                    // 테이블 이름(띄어쓰기, 대소문자 완전 일치!)

  if (!API_KEY || !BASE_ID || !TABLE_NAME) {
    return res.status(500).json({
      error: "Airtable 환경변수 설정 필요",
      code: "NO_ENV",
    });
  }

  const AIRTABLE_API_URL = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}`;

  if (req.method === "POST") {
    try {
      // 에어테이블 실제 컬럼명과 완전 일치(띄어쓰기, 대소문자 모두)
      const allowedFields = [
        "날짜",
        "성함",
        "전화번호",
        "상담 예약 시간"
      ];

      const body = req.body;
const fields = {};
for (const key of allowedFields) {
  if (body.fields && body.fields[key] !== undefined) fields[key] = body.fields[key];
}

      const airtableRes = await fetch(AIRTABLE_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields })
      });

      const data = await airtableRes.json();
      if (!airtableRes.ok) throw data;

      return res.status(200).json(data);

    } catch (e) {
      const errorObj = {
        message: e?.message || (typeof e === 'string' ? e : JSON.stringify(e)),
        code: e?.code || e?.error || 'INTERNAL_ERROR',
        stack: e?.stack || null,
        raw: e,
      };
      console.error("API /api/submit POST error:", errorObj);
      return res.status(500).json(errorObj);
    }
  }

  if (req.method === "GET") {
    try {
      const airtableRes = await fetch(AIRTABLE_API_URL, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      });
      const data = await airtableRes.json();
      return res.status(200).json(data);

    } catch (e) {
      const errorObj = {
        message: e?.message || (typeof e === 'string' ? e : JSON.stringify(e)),
        code: e?.code || e?.error || 'INTERNAL_ERROR',
        stack: e?.stack || null,
        raw: e,
      };
      console.error("API /api/submit GET error:", errorObj);
      return res.status(500).json(errorObj);
    }
  }

  return res.status(405).json({ error: "허용되지 않는 요청", code: "METHOD_NOT_ALLOWED" });
}
