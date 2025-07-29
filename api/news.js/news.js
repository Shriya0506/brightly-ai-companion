// api/news.js
export default async function handler(req, res) {
  res.status(200).json({
    status: "ok",
    message: "API is working from Vercel!",
    timestamp: new Date().toISOString()
  });
}
