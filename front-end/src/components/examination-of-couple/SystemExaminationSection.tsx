import { SystemExamination } from '../../types/examination';
import SystemExaminationField from './SystemExaminationField';

interface SystemExaminationSectionProps {
  cns: SystemExamination;
  cvs: SystemExamination;
  respiratorySystem: SystemExamination;
  git: SystemExamination;
  onSystemExaminationChange: (
    system: 'cns' | 'cvs' | 'respiratorySystem' | 'git',
    field: 'status' | 'details',
    value: string
  ) => void;
  person: 'wife' | 'husband';
}

export default function SystemExaminationSection({
  cns,
  cvs,
  respiratorySystem,
  git,
  onSystemExaminationChange,
  person,
}: SystemExaminationSectionProps) {
  return (
    <div className="space-y-6">
      <SystemExaminationField
        label="CNS (Central Nervous System)"
        system="cns"
        data={cns}
        person={person}
        onChange={onSystemExaminationChange}
      />
      <SystemExaminationField
        label="CVS (Cardiovascular System)"
        system="cvs"
        data={cvs}
        person={person}
        onChange={onSystemExaminationChange}
      />
      <SystemExaminationField
        label="Respiratory System"
        system="respiratorySystem"
        data={respiratorySystem}
        person={person}
        onChange={onSystemExaminationChange}
      />
      <SystemExaminationField
        label="GIT (Gastrointestinal Tract)"
        system="git"
        data={git}
        person={person}
        onChange={onSystemExaminationChange}
      />
    </div>
  );
}