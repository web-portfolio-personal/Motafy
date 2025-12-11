'use client';

import { useState, useEffect } from 'react';
import { FiActivity, FiClock, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import { getRequestQueue } from '@/lib/requestQueue';
import { checkStorageHealth } from '@/lib/storage';

export default function ApiStatsPanel({ className = '' }) {
  const [stats, setStats] = useState(null);
  const [storage, setStorage] = useState(null);

  const refreshStats = () => {
    try {
      const queue = getRequestQueue();
      setStats(queue.getStats());
    } catch {
      setStats(null);
    }

    try {
      setStorage(checkStorageHealth());
    } catch {
      setStorage(null);
    }
  };

  useEffect(() => {
    refreshStats();
    const interval = setInterval(refreshStats, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!stats && !storage) return null;

  const getQueueColor = () => {
    if (!stats) return 'text-white/50';
    const percent = (stats.requestsInWindow / stats.maxRequests) * 100;
    if (percent >= 80) return 'text-red-400';
    if (percent >= 50) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getStorageColor = () => {
    if (!storage) return 'text-white/50';
    if (storage.critical) return 'text-red-400';
    if (storage.warning) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className={`bg-white/5 rounded-xl p-4 border border-white/10 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FiActivity className="h-4 w-4 text-white/50" />
          <span className="text-sm font-medium text-white">Estado del Sistema</span>
        </div>
        <button
          onClick={refreshStats}
          className="p-1 text-white/30 hover:text-white/60 transition-colors"
        >
          <FiRefreshCw className="h-3 w-3" />
        </button>
      </div>

      <div className="space-y-3">
        {/* API Requests */}
        {stats && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiClock className="h-4 w-4 text-white/30" />
              <span className="text-xs text-white/50">API Requests</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-mono ${getQueueColor()}`}>
                {stats.requestsInWindow}/{stats.maxRequests}
              </span>
              {stats.processing && (
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              )}
              {stats.queueLength > 0 && (
                <span className="text-xs text-white/30">
                  (+{stats.queueLength} en cola)
                </span>
              )}
            </div>
          </div>
        )}

        {/* Storage */}
        {storage && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiActivity className="h-4 w-4 text-white/30" />
              <span className="text-xs text-white/50">Storage</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-mono ${getStorageColor()}`}>
                {storage.usedMB}MB / {storage.totalMB}MB
              </span>
              {(storage.warning || storage.critical) && (
                <FiAlertTriangle className={`h-3 w-3 ${storage.critical ? 'text-red-400' : 'text-yellow-400'}`} />
              )}
            </div>
          </div>
        )}

        {/* Progress bars */}
        <div className="space-y-1.5 mt-2">
          {stats && (
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  (stats.requestsInWindow / stats.maxRequests) >= 0.8 ? 'bg-red-400' :
                  (stats.requestsInWindow / stats.maxRequests) >= 0.5 ? 'bg-yellow-400' :
                  'bg-green-400'
                }`}
                style={{ width: `${(stats.requestsInWindow / stats.maxRequests) * 100}%` }}
              />
            </div>
          )}
          {storage && (
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  storage.critical ? 'bg-red-400' :
                  storage.warning ? 'bg-yellow-400' :
                  'bg-green-400'
                }`}
                style={{ width: `${storage.percentage}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

