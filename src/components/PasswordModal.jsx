import { useRef, useState } from 'react';

const ACCESS_CODE = 'vladSosnov2026';

export default function PasswordModal({ onUnlock }) {
  const entryRef = useRef(null);
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  function submitCode() {
    if (value === ACCESS_CODE) {
      onUnlock();
    } else {
      setError(true);
      setValue('');
      if (entryRef.current) {
        entryRef.current.textContent = '';
      }
    }
  }

  function handleInput(e) {
    setValue(e.currentTarget.textContent ?? '');
    setError(false);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitCode();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }

  return (
    <div className="access-gate-overlay">
      <div className="access-gate-card">
        <h2>Goal Tracker</h2>
        <div className="access-gate-controls">
          <div
            ref={entryRef}
            className="access-code-entry"
            contentEditable="plaintext-only"
            role="textbox"
            data-placeholder="Enter access code"
            aria-label="Access code"
            data-1p-ignore="true"
            data-lpignore="true"
            spellCheck="false"
            tabIndex={0}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
          />
          {error && <p className="access-gate-error">Incorrect access code</p>}
          <button type="button" onClick={submitCode}>Continue</button>
        </div>
      </div>
    </div>
  );
}
