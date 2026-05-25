interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  return (
    <div className="flex items-center justify-between mt-4">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing page {currentPage} of {totalPages}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400"
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, index: number) => (
          <button
            key={index}
            onClick={() => onPageChange(index + 1)}
            className={`px-3 py-1 text-sm border rounded dark:border-gray-700 transition-colors ${
              currentPage === index + 1
                ? "bg-blue-500 text-white border-blue-500"
                : "hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
          >
            {index + 1}
          </button>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400"
        >
          Next
        </button>
      </div>
    </div>
  );
}