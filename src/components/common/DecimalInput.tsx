import { useState } from "react";

interface DecimalInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
}

export const DecimalInput = ({
  value,
  onChange,
  placeholder = "0.00",
  className,
}: DecimalInputProps) => {
  const [displayValue, setDisplayValue] = useState(() =>
    value > 0 ? String(value) : ""
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    
    val = val.replace(/[^0-9.,]/g, "");
    val = val.replace(",", ".");
    
    const dotIndex = val.indexOf(".");
    if (dotIndex !== -1) {
      val =
        val.substring(0, dotIndex + 1) +
        val.substring(dotIndex + 1).replace(/[.,]/g, "");
    }
    
    if (dotIndex !== -1) {
      const intPart = val.substring(0, dotIndex);
      const decPart = val.substring(dotIndex + 1, dotIndex + 3);
      val = `${intPart}.${decPart}`;
    }
    
    setDisplayValue(val);
    onChange(parseFloat(val) || 0);
  };

  const handleBlur = () => {
    const num = parseFloat(displayValue);
    if (!isNaN(num)) {
      setDisplayValue(num.toFixed(2));
    }
  };

  const handleFocus = () => {
    if (displayValue === "0.00" || displayValue === "0") {
      setDisplayValue("");
    }
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      value={displayValue}
      placeholder={placeholder}
      className={className}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
    />
  );
};