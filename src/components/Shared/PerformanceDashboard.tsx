import React, { useState, useEffect } from 'react';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';

const PerformanceDashboard: React.FC = () => {
  const { metrics, isPerformanceGood, measureNetworkLatency } = usePerformanceMonitor();
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const performLatencyCheck = async () => {
      if (isMounted) {
        await measureNetworkLatency();
      }
    };

    // Initial measurement
    performLatencyCheck();

    // Measure network latency every 10 seconds
    const interval = setInterval(() => {
      if (isMounted) {
        performLatencyCheck();
      }
    }, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [measureNetworkLatency]);

  // Auto-show dashboard if performance is poor
  useEffect(() => {
    if (!isPerformanceGood && !isVisible) {
      setIsVisible(true);
    }
  }, [isPerformanceGood, isVisible]);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors z-40"
        title="성능 모니터링"
      >
        📊
      </button>
    );
  }

  const getStatusColor = (value: number, threshold: number, inverse = false) => {
    const isGood = inverse ? value < threshold : value > threshold;
    return isGood ? 'text-green-600' : 'text-red-600';
  };

  const getMetricStatus = () => {
    const issues = [];
    if (metrics.frameRate < 30) issues.push('낮은 프레임률');
    if (metrics.renderTime > 16) issues.push('긴 렌더링 시간');
    if (metrics.networkLatency > 150) issues.push('높은 네트워크 지연');
    
    return issues.length === 0 ? '양호' : issues.join(', ');
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg z-40 max-w-sm">
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          📊 성능 모니터링
          <span 
            className={`w-2 h-2 rounded-full ${isPerformanceGood ? 'bg-green-400' : 'bg-red-400'}`}
            title={isPerformanceGood ? '성능 양호' : '성능 주의'}
          />
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-500 hover:text-gray-700 rounded"
            title={isExpanded ? '접기' : '펼치기'}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 text-gray-500 hover:text-gray-700 rounded"
            title="닫기"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="p-3 space-y-2 text-xs">
        {/* Key metrics always visible */}
        <div className="flex justify-between items-center">
          <span>네트워크 지연:</span>
          <span className={getStatusColor(metrics.networkLatency, 150, true)}>
            {metrics.networkLatency}ms {metrics.networkLatency <= 150 ? '✓' : '⚠️'}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span>프레임률:</span>
          <span className={getStatusColor(metrics.frameRate, 30)}>
            {metrics.frameRate} FPS
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span>상태:</span>
          <span className={isPerformanceGood ? 'text-green-600' : 'text-red-600'}>
            {getMetricStatus()}
          </span>
        </div>

        {isExpanded && (
          <>
            <hr className="my-2" />
            
            <div className="flex justify-between items-center">
              <span>렌더링 시간:</span>
              <span className={getStatusColor(metrics.renderTime, 16, true)}>
                {metrics.renderTime}ms
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span>캔버스 작업:</span>
              <span className="text-gray-600">
                {metrics.canvasOperations}회
              </span>
            </div>

            {metrics.memoryUsage && (
              <div className="flex justify-between items-center">
                <span>메모리 사용:</span>
                <span className="text-gray-600">
                  {metrics.memoryUsage}MB
                </span>
              </div>
            )}

            <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
              <div className="text-gray-700 space-y-1">
                <div>• 프레임률: 30+ FPS 권장</div>
                <div>• 렌더링: 16ms 이하 권장</div>
                <div>• 네트워크: 150ms 이하 필수</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PerformanceDashboard;