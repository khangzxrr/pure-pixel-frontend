import {
  ChevronDown,
  Search,
  XCircle,
  AlertCircle,
  BarChart3,
  BarChart2,
  BarChart,
  Clock,
} from "lucide-react";
import { useState, useRef } from "react";

export default function ComFilters({ filterSections, displayOptions }) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDisplayOpen, setIsDisplayOpen] = useState(false);

  // State to track selected filters
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [selectedDisplay, setSelectedDisplay] = useState("");

  // Refs for the dropdowns
  const filterRef = useRef(null);
  const displayRef = useRef(null);

  // Handle filter checkbox change
  const handleFilterChange = (sectionTitle, optionLabel) => {
    setSelectedFilters((prev) => {
      const updatedFilters = [...prev];
      const sectionIndex = updatedFilters.findIndex(
        (s) => s.title === sectionTitle
      );

      // If section doesn't exist yet, add it
      if (sectionIndex === -1) {
        updatedFilters.push({ title: sectionTitle, options: [optionLabel] });
      } else {
        const section = updatedFilters[sectionIndex];
        // Toggle the option in the existing section
        if (section.options.includes(optionLabel)) {
          section.options = section.options.filter(
            (item) => item !== optionLabel
          );
        } else {
          section.options.push(optionLabel);
        }
      }
      return updatedFilters;
    });
  };

  // Handle display option change (radio button)
  const handleDisplayChange = (option) => {
    setSelectedDisplay(option);
  };

  // Remove filter section entirely
  const removeFilterSection = (title) => {
    setSelectedFilters((prev) =>
      prev.filter((filter) => filter.title !== title)
    );
  };

  return (
    <div className="relative inline-block text-left p-4 rounded-lg ">
      <div className="flex gap-2">
        {/* Filters Button */}
        <button
          onClick={() => {
            setIsFilterOpen((prev) => !prev);
            if (isDisplayOpen) setIsDisplayOpen(false);
          }}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-700 rounded-md hover:bg-gray-700"
        >
          Filters
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              isFilterOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Display Button */}
        <button
          onClick={() => {
            setIsDisplayOpen((prev) => !prev);
            if (isFilterOpen) setIsFilterOpen(false);
          }}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-700 rounded-md hover:bg-gray-700"
        >
          Display
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              isDisplayOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Filters Dropdown */}
      {isFilterOpen && (
        <div
          ref={filterRef}
          className="absolute left-0 z-20 mt-2 w-80 origin-top-left bg-gray-800 rounded-md shadow-lg border border-gray-700"
        >
          <div className="p-4 max-h-[80vh] overflow-y-auto">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                placeholder="Search"
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-200 placeholder-gray-400"
              />
            </div>

            <div className="space-y-4">
              {filterSections.map((section, index) => (
                <div key={index}>
                  <h3 className="flex items-center justify-between text-sm font-medium text-gray-200 mb-2">
                    {section.title}
                    <ChevronDown className="w-4 h-4" />
                  </h3>
                  <div className="space-y-2">
                    {section.options.map((option, idx) => (
                      <label
                        key={idx}
                        className="flex items-center gap-2 text-sm text-gray-300"
                      >
                        <input
                          type="checkbox"
                          checked={selectedFilters.some(
                            (f) =>
                              f.title === section.title &&
                              f.options.includes(option.label)
                          )}
                          onChange={() =>
                            handleFilterChange(section.title, option.label)
                          }
                          className="rounded border-gray-600 bg-gray-700 text-blue-500"
                        />
                        {option.icon && (
                          <span className="w-4 h-4">{option.icon}</span>
                        )}
                        {option.label}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Display Dropdown */}
      {isDisplayOpen && (
        <div
          ref={displayRef}
          className="absolute right-0 z-20 mt-2 w-56 origin-top-right bg-gray-800 rounded-md shadow-lg border border-gray-700"
        >
          <div className="p-2">
            <div className="space-y-1">
              {displayOptions.map((option, index) => (
                <label
                  key={index}
                  className="flex items-center gap-2 px-2 py-1 text-sm text-gray-300 hover:bg-gray-700 rounded-md cursor-pointer"
                >
                  <input
                    type="radio"
                    name="order"
                    checked={selectedDisplay === option}
                    onChange={() => handleDisplayChange(option)}
                    className="text-blue-500 bg-gray-700 border-gray-600"
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Display selected filters and options */}
      <div className="mt-4">
        {/* Selected Filters */}
        <div className="text-sm text-gray-400">
          <h4 className="font-medium">Selected Filters:</h4>
          {selectedFilters.length === 0 ? (
            <span className="text-gray-500">No filters selected</span>
          ) : (
            <div className="space-y-2">
              {selectedFilters.map((filter, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-2 bg-gray-700 rounded-md"
                >
                  <div className="flex flex-wrap gap-2 text-sm text-gray-300">
                    <span className="font-medium">{filter.title}:</span>
                    {filter.options.map((option, i) => (
                      <span
                        key={i}
                        className="bg-gray-600 px-2 py-1 rounded-full"
                      >
                        {option}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => removeFilterSection(filter.title)}
                    className="text-red-500 hover:text-red-400"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Display Option */}
        <div className="mt-2 text-sm text-gray-400">
          <h4 className="font-medium">Selected Display Option:</h4>
          {selectedDisplay ? (
            <span className="text-gray-300">{selectedDisplay}</span>
          ) : (
            <span className="text-gray-500">No display option selected</span>
          )}
        </div>
      </div>
    </div>
  );
}
