import { useState, useEffect } from "react";
import Select from "./Select";

interface Option {
    value: string;
    label: string;
}

interface SelectWithOtherProps {
    options: Option[];
    placeholder?: string;
    value?: string;
    onChange: (value: string, otherValue?: string) => void;
    otherPlaceholder?: string;
    className?: string;
}

export default function SelectWithOther({
    options,
    placeholder = "Select",
    value = "",
    onChange,
    otherPlaceholder = "Please specify",
    className = "",
}: SelectWithOtherProps) {
    const [isOtherSelected, setIsOtherSelected] = useState(false);
    const [otherValue, setOtherValue] = useState("");
    const [selectValue, setSelectValue] = useState("");

    // Initialize state based on value prop
    useEffect(() => {
        if (value) {
            // Check if the value is one of the options
            const isOption = options.some(opt => opt.value === value);
            if (isOption) {
                setSelectValue(value);
                setIsOtherSelected(false);
                setOtherValue("");
            } else {
                // If value doesn't match any option, treat it as "other"
                setSelectValue("other");
                setIsOtherSelected(true);
                setOtherValue(value);
            }
        } else {
            setSelectValue("");
            setIsOtherSelected(false);
            setOtherValue("");
        }
    }, [value, options]);

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = e.target.value;
        setSelectValue(selectedValue);

        if (selectedValue === "other") {
            setIsOtherSelected(true);
            setOtherValue("");
            onChange("other", "");
        } else {
            setIsOtherSelected(false);
            setOtherValue("");
            onChange(selectedValue);
        }
    };

    const handleOtherInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setOtherValue(newValue);
        onChange("other", newValue);
    };

    const handleRemoveOther = () => {
        setIsOtherSelected(false);
        setOtherValue("");
        setSelectValue("");
        onChange("", "");
    };

    return (
        <div className={className}>
            {!isOtherSelected ? (
                <select
                    value={selectValue}
                    onChange={handleSelectChange}
                    className={`h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 ${selectValue
                            ? "text-gray-800 dark:text-white/90"
                            : "text-gray-400 dark:text-gray-400"
                        } ${className}`}
                >
                    <option value="">{placeholder}</option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                    <option value="other">Other</option>
                </select>
            ) : (
                <div className="relative">
                    <input
                        type="text"
                        value={otherValue}
                        onChange={handleOtherInputChange}
                        placeholder={otherPlaceholder}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        autoFocus
                    />
                    <button
                        type="button"
                        onClick={handleRemoveOther}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        title="Remove custom input"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
}