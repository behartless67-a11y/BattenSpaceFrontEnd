"use client";

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Newspaper } from 'lucide-react';

interface NewsHeadline {
  title: string;
  url: string;
  source: string;
}

export function Footer() {
  const [headlines, setHeadlines] = useState<NewsHeadline[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Fetch news headlines from multiple free sources
    const fetchNews = async () => {
      try {
        // Using RSS2JSON to convert RSS feeds to JSON (free, no API key)
        const feeds = [
          'https://api.rss2json.com/v1/api.json?rss_url=https://news.virginia.edu/feed',
          'https://api.rss2json.com/v1/api.json?rss_url=https://feeds.npr.org/1001/rss.xml',
        ];

        const responses = await Promise.all(
          feeds.map(url => fetch(url).then(res => res.json()).catch(() => null))
        );

        const allHeadlines: NewsHeadline[] = [];

        responses.forEach(data => {
          if (data && data.items) {
            data.items.slice(0, 5).forEach((item: any) => {
              allHeadlines.push({
                title: item.title,
                url: item.link,
                source: data.feed?.title || 'News'
              });
            });
          }
        });

        if (allHeadlines.length > 0) {
          setHeadlines(allHeadlines);
        }
      } catch (err) {
        console.error('Error fetching news:', err);
      }
    };

    fetchNews();
  }, []);

  useEffect(() => {
    if (headlines.length === 0) return;

    const interval = setInterval(() => {
      setIsVisible(false);

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % headlines.length);
        setIsVisible(true);
      }, 500); // Wait for fade out
    }, 8000); // Change headline every 8 seconds

    return () => clearInterval(interval);
  }, [headlines]);

  const currentHeadline = headlines[currentIndex];

  return (
    <footer className="bg-uva-navy text-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-8">
        {/* News Ticker */}
        {headlines.length > 0 && (
          <div className="mb-6 border-t border-white/20 pt-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-uva-orange">
                <Newspaper className="w-5 h-5" />
                <span className="text-sm font-semibold">Latest News</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <a
                  href={currentHeadline?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block hover:text-uva-orange transition-all duration-500 ${
                    isVisible ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <p className="text-sm text-gray-200 truncate">
                    {currentHeadline?.title}
                  </p>
                  <p className="text-xs text-gray-400">
                    {currentHeadline?.source}
                  </p>
                </a>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div>
            <Image
              src="/bat_rgb_ko.png"
              alt="Frank Batten School of Leadership and Public Policy"
              width={250}
              height={75}
              className="h-16 w-auto"
            />
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-300 mb-1">
              Frank Batten School of Leadership and Public Policy<br />
              235 McCormick Rd, Charlottesville, VA 22904
            </p>
            <p className="text-sm">
              <a
                href="mailto:battensupport@virginia.edu"
                className="hover:text-uva-orange transition-colors"
              >
                battensupport@virginia.edu
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
