import { TONCENTER_API } from '../chains.js';

/**
 * Verifies a TON payment using Toncenter's public API.
 * Without an API key this is rate-limited but works for low-volume checkouts;
 * get a free key at https://toncenter.com/ for production traffic.
 */
export async function verifyTonPayment({ payerAddress, toAddress, minAmountTon, apiKey }) {
  const url = `${TONCENTER_API}/getTransactions?address=${toAddress}&limit=20${
    apiKey ? `&api_key=${apiKey}` : ''
  }`;
  const res = await fetch(url);
  const data = await res.json();
  const txs = Array.isArray(data.result) ? data.result : [];

  for (const tx of txs) {
    const inMsg = tx.in_msg;
    if (!inMsg?.source) continue;
    if (inMsg.source !== payerAddress) continue;

    const amount = Number(inMsg.value) / 1e9;
    if (amount >= minAmountTon) {
      return { verified: true, txHash: tx.transaction_id?.hash, amount };
    }
  }
  return { verified: false };
}
