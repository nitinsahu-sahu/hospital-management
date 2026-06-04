import { SystemExamination } from '../../types/examination';

interface SystemExaminationFieldProps {
  label: string;
  system: 'cns' | 'cvs' | 'respiratorySystem' | 'git';
  data: SystemExamination;
  person: 'wife' | 'husband';
  onChange: (
    system: 'cns' | 'cvs' | 'respiratorySystem' | 'git',
    field: 'status' | 'details',
    value: string
  ) => void;
}

export default function SystemExaminationField({
  label,
  system,
  data,
  person,
  onChange,
}: SystemExaminationFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <div className="flex gap-6 mb-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={`${person}-${system}`}
            value="normal"
            checked={data.status === 'normal'}
            onChange={(e) => onChange(system, 'status', e.target.value)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Normal</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={`${person}-${system}`}
            value="abnormal"
            checked={data.status === 'abnormal'}
            onChange={(e) => onChange(system, 'status', e.target.value)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Abnormal</span>
        </label>
      </div>
      {data.status === 'abnormal' && (
        <textarea
          value={data.details}
          onChange={(e) => onChange(system, 'details', e.target.value)}
          rows={2}
          placeholder={`Please specify ${label.toLowerCase()} details...`}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 resize-none"
        />
      )}
    </div>
  );
}