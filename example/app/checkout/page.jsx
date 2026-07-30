'use client';

import { CryptoCheckout } from '1hash-crypto-gateway';
import '1hash-crypto-gateway/styles.css';

// In a real store this amount would come from the cart / order you're checking out,
// e.g. read from a query param, server component prop, or your order database.
export default function CheckoutPage({ searchParams }) {
  const amount = Number(searchParams?.amount) || 49.0;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 16px' }}>
      <CryptoCheckout
        amount={amount}
        productName="Pro Plan — Monthly"
        portalName="1hash.space"
        logo="/logo.png"
        coinLogos={{
          USDC: '/coins/usdc.png',
          USDT: '/coins/usdt.png',
          BTC: '/coins/btc.png',
          ETH: '/coins/eth.png',
          TON: '/coins/ton.png',
        }}
        coffeeGif="/coffee.gif"
        merchantWallets={{
          USDC: '0xYourEthereumReceivingAddress',
          USDT: '0xYourEthereumReceivingAddress',
          ETH: '0xYourEthereumReceivingAddress',
          BTC: 'bc1qYourBitcoinReceivingAddress',
          TON: 'EQYourTonReceivingAddress',
        }}
        successRedirectUrl="/checkout/success"
        failRedirectUrl="/checkout/failed"
      />
    </div>
  );
}
