// 📘 NewsWeather.tsx
import React, { useState, useEffect } from 'react';
import {
  Newspaper, Cloud, MessageCircle, MapPin, Calendar
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ChatInterface from '../components/ChatInterface';

const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

interface NewsItem {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: { name: string };
}

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  forecast: Array<{
    day: string;
    high: number;
    low: number;
    condition: string;
  }>;
}

const NewsWeather: React.FC = () => {
  const { userProfile } = useAuth();
  const [showChat, setShowChat] = useState(false);
  const [activeTab, setActiveTab] = useState<'news' | 'weather'>('news');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(
          `https://newsapi.org/v2/top-headlines?country=in&pageSize=20&apiKey=${NEWS_API_KEY}`
        );
        const data = await response.json();
        setNews(data.articles || []);
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    };

    fetchNews();
  }, [userProfile]);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const location = userProfile?.city || 'Delhi';
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${WEATHER_API_KEY}`
        );
        const data = await res.json();

        const forecastRes = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${location}&units=metric&cnt=5&appid=${WEATHER_API_KEY}`
        );
        const forecastData = await forecastRes.json();

        const forecast = forecastData.list.map((item: any) => ({
          day: new Date(item.dt * 1000).toLocaleDateString('en-IN', { weekday: 'short' }),
          high: Math.round(item.main.temp_max),
          low: Math.round(item.main.temp_min),
          condition: item.weather[0].main,
        }));

        setWeather({
          location: `${data.name}, ${data.sys.country}`,
          temperature: Math.round(data.main.temp),
          condition: data.weather[0].description,
          humidity: data.main.humidity,
          windSpeed: data.wind.speed,
          forecast,
        });
      } catch (error) {
        console.error('Failed to fetch weather:', error);
      }
    };

    fetchWeather();
  }, [userProfile]);

  if (showChat) {
    return (
      <div className="h-screen flex flex-col">
        <div className="p-4 bg-gradient-to-r from-blue-400 to-gray-500 text-white">
          <button onClick={() => setShowChat(false)} className="mb-2 text-white/80 hover:text-white">
            ← Back to News & Weather
          </button>
        </div>
        <div className="flex-1">
          <ChatInterface
            tabType="news-weather"
            gradient="from-blue-400 to-gray-500"
            placeholder="Ask me to explain news articles, weather forecasts, or current events..."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-400 to-gray-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Newspaper size={32} />
                <div>
                  <h1 className="text-3xl font-bold">News & Weather</h1>
                  <p className="text-white/80">Stay informed with AI-powered summaries</p>
                </div>
              </div>
              <button
                onClick={() => setShowChat(true)}
                className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-xl font-semibold hover:bg-white/30 transition-all transform hover:scale-105"
              >
                <MessageCircle size={20} />
                <span>Chat with {userProfile?.buddyName}</span>
              </button>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex border-b border-gray-200">
            {['news', 'weather'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as 'news' | 'weather')}
                className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  {tab === 'news' ? <Newspaper size={20} /> : <Cloud size={20} />}
                  <span>{tab === 'news' ? 'News' : 'Weather'}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'news' ? (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Top Headlines</h2>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar size={16} />
                    <span className="text-sm">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="space-y-6">
                  {news.map((article, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow"
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-2 hover:text-blue-600 cursor-pointer">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 mb-3">{article.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="font-medium">{article.source.name}</span>
                        <span>•</span>
                        <span>{new Date(article.publishedAt).toLocaleTimeString()}</span>
                      </div>
                      <button
                        onClick={() => setShowChat(true)}
                        className="mt-3 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                      >
                        Explain This
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              weather && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <MapPin size={20} className="text-blue-600" />
                          <h2 className="text-xl font-bold text-gray-800">{weather.location}</h2>
                        </div>
                        <div className="text-5xl font-bold text-blue-600 mb-2">
                          {weather.temperature}°C
                        </div>
                        <p className="text-gray-700 font-medium">{weather.condition}</p>
                      </div>
                      <div className="text-right">
                        <div className="w-24 h-24 bg-blue-200 rounded-full flex items-center justify-center mb-4">
                          <Cloud size={48} className="text-blue-600" />
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>Humidity: {weather.humidity}%</p>
                          <p>Wind: {weather.windSpeed} km/h</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">5-Day Forecast</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {weather.forecast.map((day, index) => (
                        <div key={index} className="bg-gray-50 rounded-xl p-4 text-center">
                          <p className="font-semibold text-gray-800 mb-2">{day.day}</p>
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Cloud size={24} className="text-blue-600" />
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{day.condition}</p>
                          <div className="text-sm">
                            <span className="font-semibold text-gray-800">{day.high}°</span>
                            <span className="text-gray-500"> / {day.low}°</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-cyan-50 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-cyan-800 mb-2">Weather Tips</h3>
                    <p className="text-cyan-700 mb-4">
                      Get personalized weather advice and outfit suggestions from {userProfile?.buddyName}.
                    </p>
                    <button
                      onClick={() => setShowChat(true)}
                      className="bg-cyan-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-cyan-700 transition-colors"
                    >
                      Ask for Weather Advice
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsWeather;
