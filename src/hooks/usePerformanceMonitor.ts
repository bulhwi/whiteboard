import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  frameRate: number;
  memoryUsage?: number;
  networkLatency: number;
  canvasOperations: number;
}

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    frameRate: 0,
    networkLatency: 0,
    canvasOperations: 0,
  });

  const frameCount = useRef(0);
  const lastFrameTime = useRef(Date.now());
  const renderStartTime = useRef(0);
  const canvasOpsCount = useRef(0);
  const networkRequests = useRef<number[]>([]);

  // Frame rate monitoring
  useEffect(() => {
    let animationId: number;

    const measureFrameRate = () => {
      frameCount.current++;
      const now = Date.now();
      
      if (now - lastFrameTime.current >= 1000) {
        const fps = Math.round((frameCount.current * 1000) / (now - lastFrameTime.current));
        
        setMetrics(prev => ({
          ...prev,
          frameRate: fps,
        }));
        
        frameCount.current = 0;
        lastFrameTime.current = now;
      }

      animationId = requestAnimationFrame(measureFrameRate);
    };

    animationId = requestAnimationFrame(measureFrameRate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  // Memory usage monitoring (if supported)
  useEffect(() => {
    const checkMemoryUsage = () => {
      if ('memory' in performance) {
        const memInfo = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memoryUsage: Math.round(memInfo.usedJSHeapSize / 1024 / 1024), // MB
        }));
      }
    };

    const interval = setInterval(checkMemoryUsage, 5000);
    checkMemoryUsage();

    return () => clearInterval(interval);
  }, []);

  const measureRenderStart = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  const measureRenderEnd = useCallback(() => {
    const renderTime = performance.now() - renderStartTime.current;
    setMetrics(prev => ({
      ...prev,
      renderTime: Math.round(renderTime * 100) / 100,
    }));
  }, []);

  const trackCanvasOperation = useCallback(() => {
    canvasOpsCount.current++;
    setMetrics(prev => ({
      ...prev,
      canvasOperations: canvasOpsCount.current,
    }));
  }, []);

  const measureNetworkLatency = useCallback(async (testUrl?: string) => {
    const start = performance.now();
    
    try {
      // Use a simple ping-like request or measure existing network calls
      await fetch(testUrl || window.location.origin, { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      const latency = performance.now() - start;
      networkRequests.current.push(latency);
      
      // Keep only last 10 measurements for average
      if (networkRequests.current.length > 10) {
        networkRequests.current.shift();
      }
      
      const avgLatency = networkRequests.current.reduce((sum, val) => sum + val, 0) / networkRequests.current.length;
      
      setMetrics(prev => ({
        ...prev,
        networkLatency: Math.round(avgLatency),
      }));
    } catch (error) {
      console.warn('Network latency measurement failed:', error);
    }
  }, []);

  const resetMetrics = useCallback(() => {
    frameCount.current = 0;
    canvasOpsCount.current = 0;
    networkRequests.current = [];
    setMetrics({
      renderTime: 0,
      frameRate: 0,
      networkLatency: 0,
      canvasOperations: 0,
    });
  }, []);

  const isPerformanceGood = useMemo(() => {
    return (
      metrics.frameRate >= 30 && // Minimum 30 FPS
      metrics.renderTime <= 16 && // Max 16ms per frame for 60 FPS
      metrics.networkLatency <= 150 // Under 150ms as required
    );
  }, [metrics.frameRate, metrics.renderTime, metrics.networkLatency]);

  return {
    metrics,
    measureRenderStart,
    measureRenderEnd,
    trackCanvasOperation,
    measureNetworkLatency,
    resetMetrics,
    isPerformanceGood,
  };
};