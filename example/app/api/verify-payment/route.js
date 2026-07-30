import { verifyPayment } from '1hash-crypto-gateway/server';

export async function POST(req) {
  const body = await req.json();

  const result = await verifyPayment({
    coin: body.coin,
    payerAddress: body.payerAddress,
    merchantAddress: body.merchantAddress,
    amountUsd: body.amountUsd,
    checkoutStartedAt: body.checkoutStartedAt,

    // Only needed to verify native ETH payments — get a free key at etherscan.io/apis.
    etherscanApiKey: process.env.ETHERSCAN_API_KEY,

    // Optional: raises Toncenter's rate limit for TON checks.
    tonApiKey: process.env.TONCENTER_API_KEY,
  });

  return Response.json(result);
}
