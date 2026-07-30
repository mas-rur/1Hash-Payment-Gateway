'use client';

import { useEffect, useRef, useState } from 'react';
import { COINS } from './lib/chains.js';
import CoinGrid from './components/CoinGrid.jsx';
import WalletInput from './components/WalletInput.jsx';
import VerifyingScreen from './components/VerifyingScreen.jsx';
import ResultScreen from './components/ResultScreen.jsx';

function goTo(target) {
  if (!target) return;
  if (typeof target === 'function') return target();
  if (typeof window !== 'undefined') window.location.href = target;
}

/**
 * <CryptoCheckout />
 *
 * A drop-in crypto checkout card for Next.js. The merchant controls the amount
 * and receiving wallets; this component handles coin selection, collecting the
 * payer's sending address, and polling your verify endpoint until the payment
 * is confirmed on-chain.
 *
 * Required props:
 *  - amount            USD amount to charge (set per-checkout by the merchant)
 *  - merchantWallets   { USDC, USDT, BTC, ETH, TON } receiving addresses — only
 *                       the coins you provide a wallet for are offered
 *
 * Common optional props:
 *  - productName, logo, portalName, coinLogos, coffeeGif
 *  - successRedirectUrl, failRedirectUrl  (string URL or function)
 *  - verifyEndpoint    defaults to '/api/verify-payment'
 *  - pollIntervalMs    defaults to 4000
 *  - timeoutMs         defaults to 10 minutes
 *  - soonBadge         defaults to true ("Soon")
 */
export default function CryptoCheckout({
  amount,
  productName = 'Order total',
  merchantWallets = {},
  coins,
  logo,
  portalName = '1hash.space',
  coinLogos = {},
  coffeeGif,
  successRedirectUrl,
  failRedirectUrl,
  verifyEndpoint = '/api/verify-payment',
  pollIntervalMs = 4000,
  timeoutMs = 10 * 60 * 1000,
  soonBadge = true,
}) {
  const [step, setStep] = useState('idle'); // idle | coins | wallet | verifying | success | failed
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [txHash, setTxHash] = useState(null);

  const pollRef = useRef(null);
  const timeoutRef = useRef(null);

  const availableCoins = (coins || COINS).filter((c) => merchantWallets[c]);

  useEffect(() => {
    return () => {
      clearInterval(pollRef.current);
      clearTimeout(timeoutRef.current);
    };
  }, []);

  function stopPolling() {
    clearInterval(pollRef.current);
    clearTimeout(timeoutRef.current);
  }

  async function handleWalletSubmit(payerAddress) {
    setStep('verifying');
    const checkoutStartedAt = Date.now();

    async function check() {
      try {
        const res = await fetch(verifyEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            coin: selectedCoin,
            payerAddress,
            merchantAddress: merchantWallets[selectedCoin],
            amountUsd: amount,
            checkoutStartedAt,
          }),
        });
        const data = await res.json();
        if (data.verified) {
          stopPolling();
          setTxHash(data.txHash);
          setStep('success');
        }
      } catch {
        // transient network error — keep polling until timeout
      }
    }

    check();
    pollRef.current = setInterval(check, pollIntervalMs);
    timeoutRef.current = setTimeout(() => {
      stopPolling();
      setStep((current) => (current === 'verifying' ? 'failed' : current));
    }, timeoutMs);
  }

  return (
    <div className="ohc">
      <div className="ohc-card">
        {step === 'idle' && (
          <div className="ohc-fade">
            <div className="ohc-header">
              {logo ? (
                <img className="ohc-logo-img" src={logo} alt={portalName} />
              ) : (
                <span className="ohc-logo-mark">
                  {portalName.slice(0, 1).toUpperCase()}
                </span>
              )}
              <span className="ohc-portal-name">{portalName}</span>
            </div>

            <div className="ohc-product">
              <div className="ohc-product-name">{productName}</div>
              <div className="ohc-amount">${Number(amount).toFixed(2)}</div>
              <div className="ohc-amount-sub">Paid in crypto, verified on-chain</div>
            </div>

            <button
              type="button"
              className="ohc-pay-btn"
              onClick={() => setStep('coins')}
            >
              Pay with Crypto
              {soonBadge && (
                <span className="ohc-soon-badge">
                  {typeof soonBadge === 'string' ? soonBadge : 'Soon'}
                </span>
              )}
            </button>
          </div>
        )}

        {step === 'coins' && (
          <CoinGrid
            coins={availableCoins}
            coinLogos={coinLogos}
            onSelect={(coin) => {
              setSelectedCoin(coin);
              setStep('wallet');
            }}
            onBack={() => setStep('idle')}
          />
        )}

        {step === 'wallet' && (
          <WalletInput
            coin={selectedCoin}
            onSubmit={handleWalletSubmit}
            onBack={() => setStep('coins')}
          />
        )}

        {step === 'verifying' && <VerifyingScreen coffeeGif={coffeeGif} />}

        {step === 'success' && (
          <ResultScreen
            status="success"
            coin={selectedCoin}
            txHash={txHash}
            onRedirect={() => goTo(successRedirectUrl)}
          />
        )}

        {step === 'failed' && (
          <ResultScreen
            status="failed"
            coin={selectedCoin}
            txHash={null}
            onRedirect={() => goTo(failRedirectUrl)}
          />
        )}
      </div>
    </div>
  );
}
