const DropdownFilter = ({ options, value, onChange }) => {
  return (
    <select
      className="form-select dropdown-menu-box"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((option, index) => (
        <option key={index} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};

export default DropdownFilter;

