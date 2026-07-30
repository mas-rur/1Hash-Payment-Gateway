# 1hash-crypto-gateway

A drop-in crypto checkout widget for Next.js. Merchants set a USD amount and
receiving wallets; customers pay with **USDC, USDT, BTC, ETH or TON**, and the
gateway confirms the payment by reading the public blockchain directly — no
custodial wallet, no middleman holding funds.

```
[ 1hash.space              ]
[                          ]
[  Pro Plan — Monthly       ]
[  $49.00                  ]
[                          ]
[  ┌─────────────────────┐ ]
[  │ Pay with Crypto  [Soon]│ ]
[  └─────────────────────┘ ]
```

## How it works

1. Customer taps **Pay with Crypto** → picks a coin (USDC / USDT / BTC / ETH / TON).
2. They enter the wallet address they're paying **from**.
3. The widget shows the "let's grab a coffee" screen and polls your API route.
4. Your API route calls `verifyPayment()`, which checks the public chain for a
   transaction from that address to your receiving address, for at least the
   expected amount (allowing a few cents of price-feed slippage).
5. Once confirmed, the customer is redirected to whatever URL you set —
   different URLs for success vs. a timed-out/failed check.

Nothing here touches private keys. `verifyPayment()` only ever reads public
chain data (via public RPC / Blockstream / Toncenter / Etherscan), so it's safe
to run entirely server-side with just your **receiving** addresses.

## Install

This package isn't on the npm registry yet — install it straight from the
folder or your own repo until you publish it under your own account:

```bash
# from a local copy of this folder
npm install /path/to/1hash-crypto-gateway

# or, once you push this folder to your own GitHub repo
npm install github:your-org/1hash-crypto-gateway

# once you run `npm publish` yourself, this is the eventual command
npm install 1hash-crypto-gateway
```

## Quick start

**1. Add your assets** to `public/`:

```
public/
  logo.png          ← your 1hash.space / merchant logo
  coffee.gif         ← shown on the "verifying" screen
  coins/
    usdc.png  usdt.png  btc.png  eth.png  ton.png
```

**2. Add the checkout card** to any page:

```jsx
'use client';
import { CryptoCheckout } from '1hash-crypto-gateway';
import '1hash-crypto-gateway/styles.css';

export default function CheckoutPage() {
  return (
    <CryptoCheckout
      amount={49.0}                 // ← set per-order by you, the merchant
      productName="Pro Plan — Monthly"
      logo="/logo.png"
      coinLogos={{
        USDC: '/coins/usdc.png', USDT: '/coins/usdt.png',
        BTC: '/coins/btc.png',   ETH: '/coins/eth.png', TON: '/coins/ton.png',
      }}
      coffeeGif="/coffee.gif"
      merchantWallets={{
        USDC: '0xYourAddress', USDT: '0xYourAddress', ETH: '0xYourAddress',
        BTC: 'bc1qYourAddress', TON: 'EQYourAddress',
      }}
      successRedirectUrl="/checkout/success"
      failRedirectUrl="/checkout/failed"
    />
  );
}
```

Only coins you provide a wallet for are shown — drop a key from
`merchantWallets` to offer fewer than five.

**3. Add the verify route** (this is the one file you own — it's how the
widget checks the chain without ever seeing your private keys):

```js
// app/api/verify-payment/route.js
import { verifyPayment } from '1hash-crypto-gateway/server';

export async function POST(req) {
  const body = await req.json();
  const result = await verifyPayment({
    coin: body.coin,
    payerAddress: body.payerAddress,
    merchantAddress: body.merchantAddress,
    amountUsd: body.amountUsd,
    checkoutStartedAt: body.checkoutStartedAt,
    etherscanApiKey: process.env.ETHERSCAN_API_KEY, // needed for ETH only
  });
  return Response.json(result);
}
```

See `example/` for a full working page + route.

## Setting a custom amount per merchant / order

Since `amount` is just a prop, wire it to whatever decides your price —
a query param, an order fetched from your database, a server component:

```jsx
export default function CheckoutPage({ searchParams }) {
  const amount = Number(searchParams.amount); // e.g. /checkout?amount=129.00
  return <CryptoCheckout amount={amount} merchantWallets={{ /* ... */ }} />;
}
```

## `<CryptoCheckout />` props

| Prop | Type | Required | Description |
|---|---|---|---|
| `amount` | number | ✅ | USD price to charge |
| `merchantWallets` | object | ✅ | `{ USDC, USDT, BTC, ETH, TON }` receiving addresses |
| `productName` | string | | Label above the amount |
| `logo` | string | | Path to your logo (top-left). Falls back to a monogram. |
| `portalName` | string | | Default `"1hash.space"` |
| `coinLogos` | object | | `{ USDC: '/coins/usdc.png', ... }` |
| `coffeeGif` | string | | Path to the "verifying" animation. Falls back to ☕ |
| `coins` | string[] | | Restrict/reorder the offered coins |
| `successRedirectUrl` | string \| function | | Where "Continue to merchant" goes |
| `failRedirectUrl` | string \| function | | Where the failure screen's button goes |
| `verifyEndpoint` | string | | Default `/api/verify-payment` |
| `pollIntervalMs` | number | | Default `4000` |
| `timeoutMs` | number | | Default `600000` (10 min) |
| `soonBadge` | bool \| string | | Default `true` → shows a "Soon" badge on the button |

## `verifyPayment()` options (server)

| Option | Required | Notes |
|---|---|---|
| `coin`, `payerAddress`, `merchantAddress`, `amountUsd` | ✅ | Core inputs |
| `toleranceUsd` | | Amount allowed *below* `amountUsd` and still count as paid. Default `0.05`. |
| `checkoutStartedAt` | | Ignores transactions older than this. Default: 1 hour ago. |
| `rpcUrl`, `tokenAddress` | | Override to verify USDC/USDT/ETH on another EVM chain (Base, Polygon, Arbitrum...) |
| `etherscanApiKey` | for ETH | Free key at etherscan.io/apis |
| `tonApiKey` | optional | Raises Toncenter's rate limit |

### Defaults per coin

- **USDC / USDT** — checked as ERC-20 transfers on **Ethereum mainnet** via a
  public RPC (`eth_getLogs`, no API key). Pass `rpcUrl` + `tokenAddress` to
  point at Base/Polygon/Arbitrum/BSC instead.
- **ETH** — native transfer, checked via the **Etherscan API** (requires a free
  key — native transfers have no event logs, so this is the practical way to
  look up an address's history without running your own indexing node).
- **BTC** — checked via **Blockstream's** public Esplora API (no key).
- **TON** — checked via **Toncenter's** public API (no key required, but one
  raises the rate limit).

## A note on the "few cents lower" tolerance

Crypto prices move between the moment a customer sees a price and the moment
their wallet broadcasts a transaction. `toleranceUsd` (default $0.05) absorbs
that drift so a payment isn't rejected over a rounding difference — it never
lets someone underpay by more than that.

## License

MIT — do whatever you'd like with this.
