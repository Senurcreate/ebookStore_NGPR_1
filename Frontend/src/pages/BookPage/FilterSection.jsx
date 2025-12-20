import { useState } from "react";
import DropdownFilter from "../../components/DropdownFilter";

const FilterSection = () => {
  const authors = ["Authors", "Stephen King", "J.K. Rowling", "Paulo Coelho", "Agatha Christie"];
  const genres = ["Genres", "Horror", "Fantasy", "Science Fiction", "Romance", "Adventure"];
  const prices = ["Prices", "Under Rs 500", "Rs 500 - Rs 1000", "Above Rs 1000"];
  const ratings = ["Ratings", "1 Star", "2 Stars", "3 Stars", "4 Stars", "5 Stars"];
  const languages = ["Languages", "English", "Sinhala"];

  const defaultFilters = {
    author: authors[0],
    genre: genres[0],
    price: prices[0],
    rating: ratings[0],
    language: languages[0],
  };

  const [filters, setFilters] = useState(defaultFilters);

  const handleChange = (type, value) => {
    setFilters((prev) => ({ ...prev, [type]: value }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const isFiltered =
    filters.author !== defaultFilters.author ||
    filters.genre !== defaultFilters.genre ||
    filters.price !== defaultFilters.price ||
    filters.rating !== defaultFilters.rating ||
    filters.language !== defaultFilters.language;

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
          <button className="reset-btn" onClick={resetFilters}>
            Reset All
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterSection;
