import { useState, useEffect } from 'react';
import { populateSampleData } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

export default function DataInitializer() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check local storage to see if data has been initialized
    const dataInitializedFlag = localStorage.getItem('airsense_data_initialized');
    if (dataInitializedFlag === 'true') {
      setIsInitialized(true);
    }
  }, []);

  const initializeData = async () => {
    setIsInitializing(true);
    try {
      await populateSampleData();
      localStorage.setItem('airsense_data_initialized', 'true');
      setIsInitialized(true);
      toast({
        title: 'Success',
        description: 'Sample air quality data has been successfully loaded into Firebase!',
      });
    } catch (error) {
      console.error('Failed to initialize data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load sample data. Please check console for details.',
        variant: 'destructive',
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const resetData = async () => {
    setIsInitializing(true);
    try {
      await populateSampleData();
      toast({
        title: 'Success',
        description: 'Sample air quality data has been refreshed in Firebase!',
      });
    } catch (error) {
      console.error('Failed to reset data:', error);
      toast({
        title: 'Error',
        description: 'Failed to refresh sample data. Please check console for details.',
        variant: 'destructive',
      });
    } finally {
      setIsInitializing(false);
    }
  };

  if (isInitialized) {
    return (
      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Firebase Data Status
            </h3>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Sample air quality data is loaded and available
            </p>
          </div>
          {/* <Button
            variant="outline"
            size="sm"
            onClick={resetData}
            disabled={isInitializing}
          >
            {isInitializing ? 'Refreshing...' : 'Refresh Data'}
          </Button> */}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
            Firebase Data Required
          </h3>
          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
            Please initialize sample air quality data to see the dashboard components
          </p>
        </div>
        <Button
          variant="default"
          size="sm"
          onClick={initializeData}
          disabled={isInitializing}
        >
          {isInitializing ? 'Initializing...' : 'Initialize Data'}
        </Button>
      </div>
    </div>
  );
}