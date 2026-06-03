// components/form/OtherInputField.tsx
import { useState, useEffect } from "react";
import Input from "./InputField";

interface OtherInputFieldProps {
  isVisible: boolean;
  name: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  required?: boolean;
  type?: string;
  className?: string;
}

export default function OtherInputField({
  isVisible,
  name,
  placeholder = "Please specify",
  value,
  onChange,
  label,
  required = true,
  type = "text",
  className = "mt-3",
}: OtherInputFieldProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      // Trigger animation after render
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      // Remove from DOM after animation completes
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!shouldRender) return null;

  return (
    <div
      className={`transition-all duration-300 ease-in-out ${
        isAnimating 
          ? "opacity-100 translate-y-0 max-h-40" 
          : "opacity-0 -translate-y-2 max-h-0"
      } ${className}`}
    >
      {label && (
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <Input
        type={type}
        name={name}
        placeholder={placeholder + (required ? " *" : "")}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}