import TextareaField from './TextareaField';

interface LocalExaminationData {
  perVaginalExamination: string;
  perSpeculumExamination: string;
}

interface LocalExaminationSectionProps {
  localExamination: LocalExaminationData;
  onLocalExaminationChange: (field: string, value: string) => void;
}

export default function LocalExaminationSection({
  localExamination,
  onLocalExaminationChange,
}: LocalExaminationSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <TextareaField
        label="Per Vaginal Examination"
        name="perVaginalExamination"
        value={localExamination.perVaginalExamination}
        onChange={onLocalExaminationChange}
        placeholder="Enter per vaginal examination findings..."
      />
      <TextareaField
        label="Per Speculum Examination"
        name="perSpeculumExamination"
        value={localExamination.perSpeculumExamination}
        onChange={onLocalExaminationChange}
        placeholder="Enter per speculum examination findings..."
      />
    </div>
  );
}