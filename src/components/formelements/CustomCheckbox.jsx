import './CustomCheckbox.css';

function CustomCheckbox({
  id,
  labelText,
  name,
  checked,
  onToggle,
  onText = 'On',
  offText = 'Off',
}) {
  return (
    <label htmlFor={id} className="--custom-checkbox">
      {labelText}
      <input
        type="checkbox"
        className="toggle"
        id={id}
        name={name}
        checked={checked}
        onChange={onToggle}
      />
      <span
        className="toggle-button"
        data-tg-on={onText}
        data-tg-off={offText}
      ></span>
    </label>
  );
}

export default CustomCheckbox;
