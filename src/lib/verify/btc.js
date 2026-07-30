import { BLOCKSTREAM_API } from '../chains.js';

/**
 * Verifies a BTC payment using Blockstream's public Esplora API (no key required).
 * Bitcoin is UTXO-based, so "from" is checked by looking at the inputs (vin) of
 * transactions that pay the merchant address, rather than a single sender field.
 */
export async function verifyBtcPayment({ payerAddress, toAddress, minAmountBtc }) {
  const res = await fetch(`${BLOCKSTREAM_API}/address/${toAddress}/txs`);
  if (!res.ok) throw new Error(`Blockstream lookup failed (${res.status})`);
  const txs = await res.json();

  for (const tx of txs) {
    const hasPayerInput = (tx.vin || []).some(
      (input) => input.prevout?.scriptpubkey_address === payerAddress
    );
    if (!hasPayerInput) continue;

    const outToMerchant = (tx.vout || []).find((o) => o.scriptpubkey_address === toAddress);
    if (outToMerchant) {
      const amount = outToMerchant.value / 1e8;
      if (amount >= minAmountBtc) {
        return { verified: true, txHash: tx.txid, amount };
      }
    }
  }
  return { verified: false };
}
