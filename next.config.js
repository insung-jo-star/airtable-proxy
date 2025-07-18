module.exports = {
  async headers() {
    return [
      {
        source: "/api/(.*)",   // 프록시 API 경로만 CORS 허용!
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "https://airtable-proxy-sand.vercel.app"   // 상담신청 페이지 도메인으로 반드시 바꿔!
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,POST,OPTIONS"
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization"
          }
        ]
      },
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; connect-src 'self' https://mcs.zijieapi.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://analytics.tiktok.com; img-src *; style-src 'self' 'unsafe-inline';"
          }
        ]
      }
    ];
  }
};
