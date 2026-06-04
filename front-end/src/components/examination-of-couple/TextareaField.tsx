
interface TextareaFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (field: string, value: string) => void;
  placeholder?: string;
  rows?: number;
}

export default function TextareaField({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 3,
}: TextareaFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        rows={rows}
        placeholder={placeholder || `Enter ${label.toLowerCase()}...`}
        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 resize-none"
      />
    </div>
  );
}