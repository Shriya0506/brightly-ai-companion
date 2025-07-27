export default async function handler(request, response) {
  const NEWS_API_KEY = process.env.VITE_NEWS_API_KEY;
  const { country = 'in', category = 'general' } = request.query || {};

  try {
    const apiUrl = `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&apiKey=${NEWS_API_KEY}`;
    const res = await fetch(apiUrl);
    const data = await res.json();
    response.status(200).json(data);
  } catch (err) {
    response.status(500).json({ error: 'Failed to fetch news' });
  }
}
