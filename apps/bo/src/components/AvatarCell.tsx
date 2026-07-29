import { useState } from 'react';

interface AvatarCellProps {
  name: string;
  src?: string;
}

/** Width a table column needs to hold this cell: 40px thumb + the td's px-4. */
export const AVATAR_COLUMN_CLASS = 'w-[72px]';

/**
 * Fixed 40px round thumbnail for list tables, with initials as the fallback.
 *
 * The wrapper owns the dimensions and clips overflow, so a non-square or
 * oversized upload is cropped rather than stretching the row, and `shrink-0`
 * keeps it from being squeezed. `onError` covers URLs that no longer resolve —
 * a broken <img> would otherwise render at its own intrinsic size.
 */
export function AvatarCell({ name, src }: AvatarCellProps) {
  const [failed, setFailed] = useState(false);

  const initials = name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-indigo-50">
      {src && !failed ? (
        <img
          src={src}
          alt={name}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-xs font-bold text-indigo-600">
          {initials || '?'}
        </span>
      )}
    </div>
  );
}
