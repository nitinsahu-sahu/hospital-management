// components/form/OtherFieldGroup.tsx
import { ChangeEvent } from "react";
import Select from "./Select";
import OtherInputField from "./input/OtherInputField";
// import OtherInputField from "./OtherInputField";

interface OtherFieldGroupProps {
  selectName: string;
  selectOptions: Array<{ value: string; label: string }>;
  selectValue: string;
  selectPlaceholder: string;
  onSelectChange: (name: string, value: string) => void;
  otherInputName: string;
  otherInputValue: string;
  otherInputPlaceholder?: string;
  onOtherInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  required?: boolean;
  className?: string;
}

export default function OtherFieldGroup({
  selectName,
  selectOptions,
  selectValue,
  selectPlaceholder,
  onSelectChange,
  otherInputName,
  otherInputValue,
  otherInputPlaceholder,
  onOtherInputChange,
  label,
  required = false,
  className = "",
}: OtherFieldGroupProps) {
  const showOtherInput = selectValue === "other";
  
  return (
    <div className={className}>
      {label && (
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <Select
        options={selectOptions}
        placeholder={selectPlaceholder}
        value={selectValue}
        onChange={(val) => onSelectChange(selectName, val)}
      />
      
      <OtherInputField
        isVisible={showOtherInput}
        name={otherInputName}
        placeholder={otherInputPlaceholder || `Please specify ${label?.toLowerCase() || "details"}`}
        value={otherInputValue}
        onChange={onOtherInputChange}
        required={required}
      />
    </div>
  );
}