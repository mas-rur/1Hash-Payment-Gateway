import { ETHERSCAN_API } from '../chains.js';

/**
 * Verifies a native ETH transfer using the Etherscan API.
 * Native transfers have no event logs, so — unlike ERC-20 — this needs an indexer.
 * Get a free API key at https://etherscan.io/apis and pass it as `apiKey`.
 */
export async function verifyEthNative({
  apiKey,
  chainId = 1,
  fromAddress,
  toAddress,
  minAmountEth,
  sinceTimestamp = 0,
}) {
  if (!apiKey) {
    throw new Error(
      'verifyEthNative requires an Etherscan API key. Get a free one at https://etherscan.io/apis and pass it as `etherscanApiKey`.'
    );
  }

  const url = `${ETHERSCAN_API}?chainid=${chainId}&module=account&action=txlist&address=${toAddress}&sort=desc&apikey=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  const txs = Array.isArray(data.result) ? data.result : [];

  for (const tx of txs) {
    const sameFrom = tx.from?.toLowerCase() === fromAddress.toLowerCase();
    const sameTo = tx.to?.toLowerCase() === toAddress.toLowerCase();
    const isRecent = Number(tx.timeStamp) * 1000 >= sinceTimestamp;
    if (!sameFrom || !sameTo || !isRecent) continue;

    const amount = Number(tx.value) / 1e18;
    if (amount >= minAmountEth) {
      return { verified: true, txHash: tx.hash, amount };
    }
  }
  return { verified: false };
}
