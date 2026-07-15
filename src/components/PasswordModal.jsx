import { useState } from 'react';

const ACCESS_CODE = 'vladSosnov2026';

export default function PasswordModal({ onUnlock }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  function submitCode() {
    if (value === ACCESS_CODE) {
      onUnlock();
    } else {
      setError(true);
      setValue('');
    }
  }

  function handleChange(e) {
    setValue(e.target.value);
    setError(false);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitCode();
    }
  }

  return (
    <div className="access-gate-overlay">
      <div className="access-gate-card">
        <h2>Goal Tracker</h2>
        <div className="access-gate-controls">
          <input
            type="password"
            className="access-code-entry"
            placeholder="Enter access code"
            aria-label="Access code"
            data-1p-ignore="true"
            data-lpignore="true"
            spellCheck="false"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
          {error && <p className="access-gate-error">Incorrect access code</p>}
          <button type="button" onClick={submitCode}>Continue</button>
        </div>
      </div>
    </div>
  );
}
