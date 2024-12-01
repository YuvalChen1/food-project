"use client";

import { useEffect, useState } from 'react';
import { analyzeTrends } from '@/lib/orderAnalysis';
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrends();
  }, []);

  const loadTrends = async () => {
    try {
      setLoading(true);
      const trendData = await analyzeTrends();
      setTrends(trendData);
    } catch (error) {
      console.error("Error loading trends:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Topping Trend Analysis</h1>
        <Button onClick={loadTrends} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {trends.map((trend) => (
            <div key={trend.toppingName} className="border rounded-lg p-4 shadow-sm">
              <h2 className="font-bold text-lg mb-2">{trend.toppingName}</h2>
              <p className="text-sm text-gray-600">
                Popularity: {trend.popularity.toFixed(2)} requests/day
              </p>
              <p className="text-sm text-gray-600">
                Active for: {trend.timespan.toFixed(0)} days
              </p>
              <p className="mt-2 text-blue-600 font-medium">
                {trend.recommendation}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 