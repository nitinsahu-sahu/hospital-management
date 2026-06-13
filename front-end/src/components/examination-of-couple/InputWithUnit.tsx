interface InputWithUnitProps {
  label: string;
  name: string;
  value: string;
  unit: string;
  unitOptions: Array<{ value: string; label: string }>;
  onChange: (field: string, value: string) => void;
  placeholder?: string;
  type?: string;
}

export default function InputWithUnit({
  label,
  name,
  value,
  unit,
  unitOptions,
  onChange,
  placeholder,
  type = 'text',
}: InputWithUnitProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      
      {/* Mobile: Stack vertically (default), Tablet+: Side by side */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 w-full"
        />
        <select
          value={unit}
          onChange={(e) => onChange(`${name}Unit`, e.target.value)}
          className="sm:w-24 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
        >
          {unitOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}