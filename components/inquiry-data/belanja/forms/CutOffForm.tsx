"use client";
import React from "react";
import { Select, SelectItem, Button, Chip } from "@heroui/react";
import { Calendar, X } from "lucide-react";

// Constants
const CUT_OFF_OPTIONS = [
  { key: "januari", label: "Januari" },
  { key: "februari", label: "Februari" },
  { key: "maret", label: "Maret" },
  { key: "april", label: "April" },
  { key: "mei", label: "Mei" },
  { key: "juni", label: "Juni" },
  { key: "juli", label: "Juli" },
  { key: "agustus", label: "Agustus" },
  { key: "september", label: "September" },
  { key: "oktober", label: "Oktober" },
  { key: "november", label: "November" },
  { key: "desember", label: "Desember" },
];

interface CutOffFormProps {
  // Form state - simplified to only month selection
  cutOff: string;

  // State setters - simplified
  setCutOff: (value: string) => void;

  // Event handlers
  resetAllCutOff: () => void;

  // Additional props for styling
  className?: string;

  // Control props
  isEnabled?: boolean;
}

const CutOffForm: React.FC<CutOffFormProps> = ({
  cutOff,
  setCutOff,
  resetAllCutOff,
  className = "",
  isEnabled = true,
}) => {
  // Helper function to get current month name
  const getCurrentMonthName = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // 0-based month
    const monthNames = [
      "januari",
      "februari",
      "maret",
      "april",
      "mei",
      "juni",
      "juli",
      "agustus",
      "september",
      "oktober",
      "november",
      "desember",
    ];
    return monthNames[currentMonth];
  };

  // Handle default selection based on switch state
  React.useEffect(() => {
    if (!isEnabled) {
      // When switch is OFF: Set to current month automatically
      const currentMonthName = getCurrentMonthName();
      setCutOff(currentMonthName);
    } else {
      // When switch is ON: Set to "januari" if no selection exists (required)
      if (!cutOff) {
        setCutOff("januari");
      }
    }
  }, [isEnabled, setCutOff, cutOff]);

  // Ensure cutOff has a value when disabled (fallback for initial render)
  React.useEffect(() => {
    if (!isEnabled && !cutOff) {
      const currentMonthName = getCurrentMonthName();
      setCutOff(currentMonthName);
    }
  }, [isEnabled, cutOff, setCutOff]);

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 p-4 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 rounded-xl border border-blue-200 dark:border-blue-800 transition-all duration-200 ${
        !isEnabled ? "opacity-50" : ""
      } ${className}`}
    >
      {/* Title */}
      <div className="flex items-center gap-2">
        <Calendar className="text-blue-600 dark:text-blue-400" size={16} />
        <span className="font-medium text-blue-700 dark:text-blue-300 text-sm whitespace-nowrap">
          Data Cut Off Period
        </span>
        {!isEnabled && (
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
            (Disabled)
          </span>
        )}
      </div>{" "}
      {/* Month Selection */}
      <div>
        <Select
          selectedKeys={cutOff ? [cutOff] : []}
          onSelectionChange={(keys: any) => {
            if (isEnabled) {
              const selectedKey = Array.from(keys)[0] as string;
              setCutOff(selectedKey || "");
            }
          }}
          placeholder={
            isEnabled ? "Pilih Periode Cut Off *" : "Periode Otomatis"
          }
          aria-label="Pilih Periode Cut Off"
          variant="bordered"
          size="sm"
          className="min-w-[160px]"
          isDisabled={!isEnabled}
          isRequired={isEnabled}
          validationBehavior="native"
          // Force display of selected value even when disabled
          renderValue={(items) => {
            if (!isEnabled && cutOff) {
              const selectedOption = CUT_OFF_OPTIONS.find(
                (opt) => opt.key === cutOff
              );
              return selectedOption ? selectedOption.label : cutOff;
            }
            return items.map((item) => item.textValue).join(", ");
          }}
        >
          {CUT_OFF_OPTIONS.map((item) => (
            <SelectItem key={item.key}>{item.label}</SelectItem>
          ))}
        </Select>
      </div>{" "}
      {/* Reset Button */}
      {cutOff && isEnabled && (
        <div className="flex justify-end">
          <Button
            onClick={() => setCutOff("januari")}
            variant="flat"
            size="sm"
            color="primary"
            startContent={<X size={14} />}
            className="text-xs"
          >
            Reset to Januari
          </Button>
        </div>
      )}
    </div>
  );
};

export default CutOffForm;
