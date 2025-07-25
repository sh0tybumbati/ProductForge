import { useEffect, useRef } from 'react';

/**
 * Hook to monitor component render performance in development
 * @param componentName - Name of the component being monitored
 */
export const usePerformanceMonitor = (componentName: string) => {
  const renderStartTime = useRef<number>(0);

  // Mark render start
  renderStartTime.current = performance.now();

  useEffect(() => {
    if (import.meta.env.DEV && renderStartTime.current) {
      const renderTime = performance.now() - renderStartTime.current;
      
      // Log slow renders (>16ms could indicate performance issues)
      if (renderTime > 16) {
        console.warn(`🐌 Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
      
      // Log to performance buffer if available
      if (performance.mark) {
        performance.mark(`${componentName}-render-end`);
        if (performance.getEntriesByName(`${componentName}-render-start`).length > 0) {
          performance.measure(
            `${componentName}-render`,
            `${componentName}-render-start`,
            `${componentName}-render-end`
          );
        }
        performance.mark(`${componentName}-render-start`);
      }
    }
  }, [componentName]);

  return { componentName };
};