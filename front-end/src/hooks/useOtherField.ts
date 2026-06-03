import { useState, useEffect } from "react";

interface UseOtherFieldProps {
  mainValue: string;
  otherValue: string;
  onClear?: () => void;
}

export const useOtherField = ({ mainValue, otherValue, onClear }: UseOtherFieldProps) => {
  const [showOtherInput, setShowOtherInput] = useState(mainValue === "other");
  const [otherInputValue, setOtherInputValue] = useState(otherValue);

  useEffect(() => {
    const isOther = mainValue === "other";
    setShowOtherInput(isOther);
    
    if (!isOther && otherInputValue) {
      setOtherInputValue("");
      onClear?.();
    }
  }, [mainValue]);

  const handleOtherInputChange = (value: string) => {
    setOtherInputValue(value);
  };

  return {
    showOtherInput,
    otherInputValue,
    setOtherInputValue: handleOtherInputChange,
    setShowOtherInput,
  };
};