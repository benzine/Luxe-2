import { useState, useEffect } from 'react';
import { useFormStore } from '../../lib/form-store';

interface DependentSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  dependentOn?: { field: string; value: string };
  placeholder?: string;
  disabled?: boolean;
}

export default function DependentSelect({
  label,
  value,
  onChange,
  options,
  dependentOn,
  placeholder = 'Select...',
  disabled = false,
}: DependentSelectProps) {
  const formStore = useFormStore();
  const [isVisible, setIsVisible] = useState(!dependentOn);
  const [filteredOptions, setFilteredOptions] = useState<string[]>(options);

  // Check if this select should be visible based on dependency
  useEffect(() => {
    if (dependentOn) {
      const dependencyValue = formStore.getState()[dependentOn.field as keyof any];
      const shouldShow = dependencyValue === dependentOn.value;
      setIsVisible(shouldShow);
      
      // Clear value if hidden
      if (!shouldShow && value) {
        onChange('');
      }
    }
  }, [dependentOn, formStore, value, onChange]);

  // Filter options based on other form state if needed
  useEffect(() => {
    // Example: filter stylists based on selected service
    if (label.toLowerCase().includes('stylist')) {
      const service = formStore.getState().service;
      if (service) {
        // Show all stylists for now, could filter by service specialty
        setFilteredOptions(options);
      } else {
        setFilteredOptions([]);
      }
    } else {
      setFilteredOptions(options);
    }
  }, [label, options, formStore]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-inksoft">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || filteredOptions.length === 0}
        className="w-full rounded-lg border border-linec bg-base px-4 py-3 text-ink focus:border-rosedeep focus:outline-none focus:ring-1 focus:ring-rosedeep disabled:opacity-50"
      >
        <option value="">{placeholder}</option>
        {filteredOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
