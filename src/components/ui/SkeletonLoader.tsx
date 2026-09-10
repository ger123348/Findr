'use client';

export function PdfSkeletonLoader({ pages = 3 }: { pages?: number }) {
  return (
    <div className="flex flex-col gap-6 p-6 w-full">
      {Array.from({ length: pages }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl shadow-sm overflow-hidden"
          style={{ aspectRatio: '210/297' }} // A4 ratio
        >
          {/* Page header skeleton */}
          <div className="p-6 space-y-3">
            <div className="h-4 bg-gray-100 rounded-full w-3/4 animate-pulse" />
            <div className="h-4 bg-gray-100 rounded-full w-1/2 animate-pulse" />
          </div>
          {/* Page body skeleton */}
          <div className="px-6 pb-6 space-y-2">
            {Array.from({ length: 10 }).map((_, j) => (
              <div
                key={j}
                className="h-3 bg-gray-100 rounded-full animate-pulse"
                style={{ width: `${60 + Math.random() * 35}%`, animationDelay: `${j * 80}ms` }}
              />
            ))}
          </div>
          {/* Page footer label */}
          <div className="flex justify-center pb-4">
            <div className="h-3 w-8 bg-gray-100 rounded-full animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
