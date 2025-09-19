import { useState, useEffect, useCallback } from 'react'; // Import useCallback
import { getDashboardData } from '../services/apiService';
// ... (keep the interface definition)

interface DashboardApiData {
    sentimentTrend: any[]; // Adjust types as needed
    topicDistribution: any[];
    recentFeedback: any[];
}

export const useDashboardApi = () => {
  const [data, setData] = useState<DashboardApiData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Wrap fetchData in useCallback so it can be returned without causing re-renders
  const fetchData = useCallback(async () => {
    setIsLoading(true); // Set loading true on refetch
    try {
      const result = await getDashboardData();
      setData(result);
      setError(null); // Clear previous errors on success
    } catch (err) {
      setError('Failed to fetch dashboard data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch on component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Return the data, loading state, error, AND the refetch function
  return { data, isLoading, error, refetch: fetchData };
};