import React from 'react';

export const SkeletonCard = ({ lines = 3, dark = false }) => (
  <div
    aria-hidden="true"
    className={`animate-pulse rounded-xl border p-4 ${dark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'}`}
  >
    <div className={`mb-4 h-4 w-1/3 rounded ${dark ? 'bg-gray-700' : 'bg-gray-200'}`} />
    {Array.from({ length: lines }, (_, index) => (
      <div
        key={index}
        className={`mb-2 h-3 rounded ${index === lines - 1 ? 'w-2/3' : 'w-full'} ${dark ? 'bg-gray-700' : 'bg-gray-200'}`}
      />
    ))}
  </div>
);

export const SkeletonRow = ({ cols = 1, dark = false }) => (
  <tr aria-hidden="true" className="animate-pulse">
    {Array.from({ length: cols }, (_, index) => (
      <td key={index} className="px-4 py-3">
        <div className={`h-4 rounded ${index === 0 ? 'w-3/4' : 'w-full'} ${dark ? 'bg-gray-700' : 'bg-gray-200'}`} />
      </td>
    ))}
  </tr>
);

export const SkeletonStat = ({ dark = false }) => (
  <div
    aria-hidden="true"
    className={`animate-pulse rounded-xl border p-5 ${dark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'}`}
  >
    <div className={`mb-4 h-3 w-1/2 rounded ${dark ? 'bg-gray-700' : 'bg-gray-200'}`} />
    <div className={`mb-3 h-8 w-2/3 rounded ${dark ? 'bg-gray-700' : 'bg-gray-200'}`} />
    <div className={`h-3 w-1/3 rounded ${dark ? 'bg-gray-700' : 'bg-gray-200'}`} />
  </div>
);

export const EmptyState = ({ icon, title, subtitle, dark = false }) => (
  <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
    <span aria-hidden="true" className="mb-3 text-3xl">{icon}</span>
    <p className={`font-semibold ${dark ? 'text-gray-100' : 'text-gray-800'}`}>{title}</p>
    {subtitle && <p className={`mt-1 text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{subtitle}</p>}
  </div>
);