interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      <button
        onClick={() => onPageChange(Math.max(page - 1, 1))}
        disabled={page === 1}
        className="px-4 py-2 bg-gray-100 rounded border text-sm hover:bg-gray-200 disabled:opacity-50"
      >
        Previous
      </button>

      <span className="text-sm">
        Page <strong>{page}</strong> of {totalPages}
      </span>

      <button
        onClick={() => onPageChange(Math.min(page + 1, totalPages))}
        disabled={page === totalPages}
        className="px-4 py-2 bg-gray-100 rounded border text-sm hover:bg-gray-200 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
