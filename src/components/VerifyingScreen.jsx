'use client';

export default function VerifyingScreen({ coffeeGif }) {
  return (
    <div className="ohc-verifying ohc-fade">
      <div className="ohc-coffee-wrap">
        {coffeeGif ? (
          <img className="ohc-coffee-gif" src={coffeeGif} alt="Verifying payment" />
        ) : (
          <span style={{ fontSize: 40 }}>☕</span>
        )}
      </div>
      <div className="ohc-verifying-title">Let's grab a coffee ☕</div>
      <div className="ohc-verifying-sub">
        We're scanning the blockchain for your transaction. This usually takes a minute — hang tight.
      </div>
      <div className="ohc-progress-track">
        <div className="ohc-progress-fill" />
      </div>
    </div>
  );
}
