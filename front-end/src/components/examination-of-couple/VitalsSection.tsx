import { VitalsFormData } from '../../types/examination';
import {
  heightUnits,
  weightUnits,
  prUnits,
  bpUnits,
  bmiUnits,
} from '../../utils/examination';
import InputWithUnit from './InputWithUnit';
import TextareaField from './TextareaField';

interface VitalsSectionProps {
  vitals: VitalsFormData;
  onVitalsChange: (field: string, value: string) => void;
  showLocalExamination?: boolean;
}

export default function VitalsSection({
  vitals,
  onVitalsChange,
}: VitalsSectionProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputWithUnit
          label="Pulse Rate (PR)"
          name="pr"
          value={vitals.pr}
          unit={vitals.prUnit}
          unitOptions={prUnits}
          onChange={onVitalsChange}
          placeholder="Enter pulse rate"
        />
        <InputWithUnit
          label="Blood Pressure (BP)"
          name="bp"
          value={vitals.bp}
          unit={vitals.bpUnit}
          unitOptions={bpUnits}
          onChange={onVitalsChange}
          placeholder="Enter blood pressure"
        />
        <InputWithUnit
          label="Height"
          name="height"
          value={vitals.height}
          unit={vitals.heightUnit}
          unitOptions={heightUnits}
          onChange={onVitalsChange}
          placeholder="Enter height"
        />
        <InputWithUnit
          label="Weight"
          name="weight"
          value={vitals.weight}
          unit={vitals.weightUnit}
          unitOptions={weightUnits}
          onChange={onVitalsChange}
          placeholder="Enter weight"
        />
        <InputWithUnit
          label="BMI (Body Mass Index)"
          name="bmi"
          value={vitals.bmi}
          unit={vitals.bmiUnit}
          unitOptions={bmiUnits}
          onChange={onVitalsChange}
          placeholder="Enter BMI"
          type="number"
        />
      </div>

      {/* Abdominal Examination */}
      <div className="mt-4">
        <TextareaField
          label="Abdominal Examination"
          name="abdominalExamination"
          value={vitals.abdominalExamination}
          onChange={onVitalsChange}
          placeholder="Enter abdominal examination findings..."
        />
      </div>
    </>
  );
}