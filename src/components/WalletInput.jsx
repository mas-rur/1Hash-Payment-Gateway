'use client';

import { useState } from 'react';
import { COIN_META } from '../lib/chains.js';

export default function WalletInput({ coin, onSubmit, onBack }) {
  const [value, setValue] = useState('');
  const [touched, setTouched] = useState(false);

  const isValid = value.trim().length >= 10; // light sanity check; real validation happens on-chain

  return (
    <div className="ohc-fade">
      <div className="ohc-step-header">
        <button className="ohc-back-btn" onClick={onBack} aria-label="Back" type="button">
          ←
        </button>
        <div className="ohc-step-title">Pay with {COIN_META[coin].label}</div>
      </div>

      <div className="ohc-field-label">
        Enter the {COIN_META[coin].label} wallet address you're paying from
      </div>
      <input
        className={`ohc-input ${touched && !isValid ? 'ohc-input-error' : ''}`}
        placeholder={coin === 'BTC' ? 'bc1...' : coin === 'TON' ? 'EQ...' : '0x...'}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => setTouched(true)}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
      />
      {touched && !isValid && (
        <div className="ohc-error-text">Enter the wallet address you'll be sending from.</div>
      )}

      <button
        className="ohc-continue-btn"
        type="button"
        disabled={!isValid}
        onClick={() => onSubmit(value.trim())}
      >
        Continue
      </button>
    </div>
  );
}
