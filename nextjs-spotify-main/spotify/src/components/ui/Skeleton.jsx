'use client';

export function TrackCardSkeleton({ compact = false }) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 p-2 animate-pulse">
        <div className="w-5 h-4 bg-white/10 rounded" />
        <div className="w-10 h-10 bg-white/10 rounded" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-white/10 rounded w-3/4" />
          <div className="h-2 bg-white/10 rounded w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl animate-pulse">
      <div className="w-6 h-6 bg-white/10 rounded" />
      <div className="w-6 h-4 bg-white/10 rounded" />
      <div className="w-12 h-12 bg-white/10 rounded-lg" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-white/10 rounded w-3/4" />
        <div className="h-3 bg-white/10 rounded w-1/2" />
      </div>
      <div className="hidden md:block w-24 h-3 bg-white/10 rounded" />
      <div className="w-12 h-3 bg-white/10 rounded" />
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-white/10 rounded-full" />
        <div className="w-8 h-8 bg-white/10 rounded-full" />
      </div>
    </div>
  );
}

export function WidgetSkeleton() {
  return (
    <div className="bg-white/5 rounded-2xl p-5 border border-white/10 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-white/10 rounded-xl" />
        <div className="space-y-2">
          <div className="h-4 bg-white/10 rounded w-24" />
          <div className="h-3 bg-white/10 rounded w-32" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-10 bg-white/10 rounded-lg" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-8 bg-white/10 rounded-full w-20" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function PlaylistSkeleton({ count = 5 }) {
  return (
    <div className="bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 rounded-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-b from-spotify-green/10 to-transparent animate-pulse">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-white/10 rounded-xl" />
          <div className="space-y-2">
            <div className="h-6 bg-white/10 rounded w-32" />
            <div className="h-4 bg-white/10 rounded w-48" />
          </div>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-9 bg-white/10 rounded-full w-24" />
          ))}
        </div>
      </div>

      {/* Track list */}
      <div className="p-4 space-y-2">
        {Array(count).fill(0).map((_, i) => (
          <TrackCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="bg-white/5 rounded-2xl p-4 border border-white/10 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-white/10 rounded-xl" />
        <div className="space-y-2">
          <div className="h-4 bg-white/10 rounded w-24" />
          <div className="h-3 bg-white/10 rounded w-32" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="bg-white/5 rounded-xl p-3">
            <div className="w-8 h-8 bg-white/10 rounded-lg mb-2" />
            <div className="h-5 bg-white/10 rounded w-12 mb-1" />
            <div className="h-3 bg-white/10 rounded w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ArtistCardSkeleton() {
  return (
    <div className="flex items-center gap-3 p-2 animate-pulse">
      <div className="w-10 h-10 bg-white/10 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-white/10 rounded w-24" />
        <div className="h-2 bg-white/10 rounded w-16" />
      </div>
    </div>
  );
}

export default function Skeleton({
  className = '',
  width = 'w-full',
  height = 'h-4',
  rounded = 'rounded'
}) {
  return (
    <div
      className={`bg-white/10 animate-pulse ${width} ${height} ${rounded} ${className}`}
    />
  );
}

