import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}

function buildHref(
  page: number,
  searchParams: Record<string, string | undefined>,
) {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value && key !== "page") params.set(key, value);
  });
  params.set("page", String(page));
  return `/products?${params.toString()}`;
}

export default function Pagination({
  currentPage,
  totalPages,
  searchParams,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) =>
      totalPages <= 7 ||
      p === 1 ||
      p === totalPages ||
      Math.abs(p - currentPage) <= 1,
  );

  return (
    <div className="flex items-center justify-center gap-1 mt-10">
      {/* Prev */}
      {currentPage > 1 ? (
        <Link
          href={buildHref(currentPage - 1, searchParams)}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>
      ) : (
        <span className="w-9 h-9 rounded-full flex items-center justify-center opacity-30">
          <ChevronLeft className="w-4 h-4" />
        </span>
      )}

      {/* Page numbers */}
      {pages.map((p, idx) => {
        const prevP = pages[idx - 1];
        const showEllipsis = prevP && p - prevP > 1;
        return (
          <span key={p} className="flex items-center gap-1">
            {showEllipsis && (
              <span className="text-gray-300 text-sm px-1">…</span>
            )}
            {p === currentPage ? (
              <span className="w-9 h-9 rounded-full bg-black text-white text-sm font-medium flex items-center justify-center">
                {p}
              </span>
            ) : (
              <Link
                href={buildHref(p, searchParams)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm text-gray-600 hover:bg-gray-100 transition-colors"
              >
                {p}
              </Link>
            )}
          </span>
        );
      })}

      {/* Next */}
      {currentPage < totalPages ? (
        <Link
          href={buildHref(currentPage + 1, searchParams)}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </Link>
      ) : (
        <span className="w-9 h-9 rounded-full flex items-center justify-center opacity-30">
          <ChevronRight className="w-4 h-4" />
        </span>
      )}
    </div>
  );
}
