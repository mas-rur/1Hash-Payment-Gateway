'use client';

import { COIN_META } from '../lib/chains.js';

function CoinLogo({ coin, src }) {
  const meta = COIN_META[coin];
  if (src) {
    return (
      <img
        className="ohc-coin-logo-img"
        src={src}
        alt={`${coin} logo`}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          e.currentTarget.nextSibling.style.display = 'flex';
        }}
      />
    );
  }
  return (
    <span className="ohc-coin-logo-fallback" style={{ background: meta.color }}>
      {coin.slice(0, 1)}
    </span>
  );
}

export default function CoinGrid({ coins, coinLogos, onSelect, onBack }) {
  return (
    <div className="ohc-fade">
      <div className="ohc-step-header">
        <button className="ohc-back-btn" onClick={onBack} aria-label="Back" type="button">
          ←
        </button>
        <div className="ohc-step-title">Choose a coin</div>
      </div>
      <div className="ohc-coin-grid">
        {coins.map((coin) => (
          <button
            key={coin}
            type="button"
            className="ohc-coin-btn"
            onClick={() => onSelect(coin)}
          >
            <CoinLogo coin={coin} src={coinLogos?.[coin]} />
            <span className="ohc-coin-label">{COIN_META[coin].label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
