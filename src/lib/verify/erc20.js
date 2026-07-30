import { ERC20_TRANSFER_TOPIC, DEFAULT_ETH_RPC } from '../chains.js';

function toTopicAddress(address) {
  return '0x' + address.toLowerCase().replace(/^0x/, '').padStart(64, '0');
}

async function rpc(rpcUrl, method, params) {
  const res = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message || 'RPC error');
  return json.result;
}

/**
 * Scans recent ERC-20 Transfer events for a payment from `fromAddress` to `toAddress`
 * of at least `minAmount` tokens.
 *
 * blockLookback defaults to ~1 hour on Ethereum mainnet (12s blocks).
 */
export async function verifyErc20Transfer({
  rpcUrl = DEFAULT_ETH_RPC,
  tokenAddress,
  fromAddress,
  toAddress,
  minAmount,
  decimals,
  blockLookback = 300,
}) {
  const latestHex = await rpc(rpcUrl, 'eth_blockNumber', []);
  const latest = parseInt(latestHex, 16);
  const fromBlock = '0x' + Math.max(latest - blockLookback, 0).toString(16);

  const logs = await rpc(rpcUrl, 'eth_getLogs', [
    {
      address: tokenAddress,
      topics: [ERC20_TRANSFER_TOPIC, toTopicAddress(fromAddress), toTopicAddress(toAddress)],
      fromBlock,
      toBlock: 'latest',
    },
  ]);

  for (const log of logs || []) {
    const raw = BigInt(log.data);
    const amount = Number(raw) / 10 ** decimals;
    if (amount >= minAmount) {
      return { verified: true, txHash: log.transactionHash, amount };
    }
  }
  return { verified: false };
}
