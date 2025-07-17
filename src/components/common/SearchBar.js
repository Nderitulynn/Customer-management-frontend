import React, { useState, useEffect } from 'react';

const SearchBar = ({ placeholder = "Search...", value = "", onChange, onClear }) => {
  const [searchValue, setSearchValue] = useState(value);
  const [debouncedValue, setDebouncedValue] = useState(value);

  // Debounce delay in milliseconds
  const DEBOUNCE_DELAY = 300;

  // Update searchValue when prop value changes
  useEffect(() => {
    setSearchValue(value);
  }, [value]);

  // Debounce search functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(searchValue);
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [searchValue]);

  // Call onChange when debounced value changes
  useEffect(() => {
    if (onChange) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, onChange]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
  };

  const clearSearch = () => {
    setSearchValue('');
    setDebouncedValue('');
    if (onClear) {
      onClear();
    }
  };

  const debounceSearch = (callback, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => callback.apply(null, args), delay);
    };
  };

  return (
    <div className="search-bar">
      <div className="search-input-container">
        <div className="search-icon">
          🔍
        </div>
        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={searchValue}
          onChange={handleInputChange}
        />
        {searchValue && (
          <button
            type="button"
            className="clear-search-btn"
            onClick={clearSearch}
            title="Clear search"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;