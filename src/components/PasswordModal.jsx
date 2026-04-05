import { useState } from 'react';

const PASSWORD = 'vladSosnov2026';

export default function PasswordModal({ onUnlock }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (value === PASSWORD) {
      onUnlock();
    } else {
      setError(true);
      setValue('');
    }
  }

  return (
    <div className="password-overlay">
      <div className="password-modal">
        <h2>Goal Tracker</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Enter password"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(false); }}
            autoFocus
          />
          {error && <p className="password-error">Incorrect password</p>}
          <button type="submit">Unlock</button>
        </form>
      </div>
    </div>
  );
}
