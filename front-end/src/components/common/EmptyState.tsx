// components/common/EmptyState.tsx
import { Link } from "react-router";

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionLink?: string;
  actionText?: string;
}

export default function EmptyState({
  title = "No Data Found",
  message = "Get started by adding your first item.",
  actionLink,
  actionText = "Add New",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
        <svg
          className="w-10 h-10 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      </div>
      <h4 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-2">
        {title}
      </h4>
      <p className="text-gray-500 dark:text-gray-400 mb-4 text-center max-w-md">
        {message}
      </p>
      {actionLink && (
        <Link
          to={actionLink}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 inline-flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          {actionText}
        </Link>
      )}
    </div>
  );
}