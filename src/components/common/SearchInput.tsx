import type { ChangeEvent, KeyboardEvent } from "react";
import { Search } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
}

const SearchInput = ({
  value,
  onChange,
  placeholder = "Buscar...",
  onKeyDown,
  className = "",
}: SearchInputProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`search-input-wrapper ${className}`}>
      <div className="search-input">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="search-field"
        />
      </div>
    </div>
  );
};

export default SearchInput;
