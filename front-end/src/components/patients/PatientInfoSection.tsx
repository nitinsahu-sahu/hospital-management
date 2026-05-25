// components/patient/PatientInfoSection.tsx
interface PatientInfoSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function PatientInfoSection({
  title,
  children,
  className = "",
}: PatientInfoSectionProps) {
  return (
    <div className={className}>
      <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
        {title}
      </h4>
      {children}
    </div>
  );
}