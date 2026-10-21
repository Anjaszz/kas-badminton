'use client';

import React from 'react';

export function StatCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-2xl bg-[#121217] border border-[#22222d] p-4 sm:p-5 flex flex-col justify-between h-36"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-3 w-24 bg-zinc-800 rounded-md"></div>
            <div className="w-9 h-9 rounded-xl bg-zinc-800"></div>
          </div>
          <div className="space-y-2">
            <div className="h-7 w-32 bg-zinc-800 rounded-lg"></div>
            <div className="h-3 w-40 bg-zinc-800/60 rounded-md"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function MemberSectionSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6 animate-pulse">
      {/* Top Filter Bar Skeleton */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="h-10 bg-[#121217] border border-[#22222d] rounded-xl w-full md:w-80"></div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-20 bg-zinc-800/80 rounded-xl"></div>
          <div className="h-9 w-24 bg-zinc-800/80 rounded-xl"></div>
          <div className="h-9 w-24 bg-zinc-800/80 rounded-xl"></div>
        </div>
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-[#121217] rounded-2xl border border-[#22222d] p-5 space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-zinc-800"></div>
                <div className="space-y-2">
                  <div className="h-4 w-28 bg-zinc-800 rounded-md"></div>
                  <div className="h-3 w-20 bg-zinc-800/60 rounded-md"></div>
                </div>
              </div>
              <div className="h-6 w-16 bg-zinc-800 rounded-full"></div>
            </div>

            <div className="bg-[#0a0a0f] p-3 rounded-xl border border-zinc-800/60 h-16 flex items-center justify-between">
              <div className="space-y-1.5">
                <div className="h-2.5 w-16 bg-zinc-800 rounded"></div>
                <div className="h-4 w-24 bg-zinc-800 rounded"></div>
              </div>
              <div className="h-6 w-14 bg-zinc-800 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TransactionSectionSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6 animate-pulse">
      {/* Search & filter bar skeleton */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="h-10 bg-[#121217] border border-[#22222d] rounded-xl w-full md:w-80"></div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-24 bg-zinc-800/80 rounded-xl"></div>
          <div className="h-9 w-24 bg-zinc-800/80 rounded-xl"></div>
        </div>
      </div>

      {/* Rows skeleton */}
      <div className="bg-[#121217] rounded-2xl border border-[#22222d] divide-y divide-zinc-800/60 overflow-hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4 sm:p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-800"></div>
              <div className="space-y-2">
                <div className="h-4 w-32 sm:w-44 bg-zinc-800 rounded-md"></div>
                <div className="h-3 w-24 bg-zinc-800/60 rounded-md"></div>
              </div>
            </div>
            <div className="space-y-1.5 text-right">
              <div className="h-5 w-24 sm:w-28 bg-zinc-800 rounded-md ml-auto"></div>
              <div className="h-3 w-16 bg-zinc-800/60 rounded-md ml-auto"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
