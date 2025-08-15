import './LabelInput.css';

function LabelInput({
  id,
  labelText,
  hasError,
  name,
  ariaLabel,
  onFocus,
  onBlur,
  onChange,
  value,
  maxLength,
}) {
  return (
    <>
      <label className="labelInput" htmlFor={id}>
        {labelText}
      </label>
      <input
        type="text"
        className={'--global-no-spinner' + (hasError ? ' error' : '')}
        name={name}
        id={id}
        aria-label={ariaLabel}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={onChange}
        value={value}
        maxLength={maxLength}
      />
    </>
  );
}

export default LabelInput;
