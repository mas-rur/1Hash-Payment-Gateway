'use client';

function truncate(hash) {
  if (!hash) return '—';
  return hash.length > 14 ? `${hash.slice(0, 8)}…${hash.slice(-6)}` : hash;
}

export default function ResultScreen({ status, txHash, coin, onRedirect, redirectLabel }) {
  const isSuccess = status === 'success';

  return (
    <div className="ohc-result ohc-fade">
      <div className={`ohc-result-icon ${isSuccess ? 'success' : 'fail'}`}>
        <span style={{ fontSize: 22 }}>{isSuccess ? '✓' : '✕'}</span>
      </div>
      <div className="ohc-result-title">
        {isSuccess ? 'Payment verified' : "We couldn't verify this payment"}
      </div>
      <div className="ohc-result-sub">
        {isSuccess
          ? `Your ${coin} transaction was confirmed on-chain.`
          : 'No matching transaction was found in time. You can try again or contact the merchant.'}
      </div>
      {isSuccess && (
        <div className="ohc-tx-row">
          <span>Transaction</span>
          <span>{truncate(txHash)}</span>
        </div>
      )}
      <button
        type="button"
        className={`ohc-redirect-btn ${isSuccess ? 'success' : 'fail'}`}
        onClick={onRedirect}
      >
        {redirectLabel || (isSuccess ? 'Continue to merchant' : 'Return to merchant')}
      </button>
    </div>
  );
}
