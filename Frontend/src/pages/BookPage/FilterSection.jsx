import { useState } from "react";
import DropdownFilter from "../../components/DropdownFilter";

const FilterSection = ({
  filters,
  setFilters,
  authors,
  genres,
  prices,
  ratings,
  languages,
  onReset
}) => {

  const handleChange = (type, value) => {
    setFilters(prev => ({ ...prev, [type]: value }));
  };

  const isFiltered =
    filters.author !== authors[0] ||
    filters.genre !== genres[0] ||
    filters.price !== prices[0] ||
    filters.rating !== ratings[0] ||
    filters.language !== languages[0];

  return (
    <div className="filter-section">
      {/* LEFT */}
      <div className="filter-left">
        <i className="bi bi-funnel"></i>
        <span>Filters</span>
      </div>

      {/* CENTER */}
      <div className="filter-center">
        <DropdownFilter options={authors} value={filters.author} onChange={(v) => handleChange("author", v)} />
        <DropdownFilter options={genres} value={filters.genre} onChange={(v) => handleChange("genre", v)} />
        <DropdownFilter options={prices} value={filters.price} onChange={(v) => handleChange("price", v)} />
        <DropdownFilter options={ratings} value={filters.rating} onChange={(v) => handleChange("rating", v)} />
        <DropdownFilter options={languages} value={filters.language} onChange={(v) => handleChange("language", v)} />
      </div>

      {/* RIGHT */}
      <div className="filter-right">
        {isFiltered && (
          <button className="reset-btn" onClick={onReset}>
            Reset All
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterSection;
