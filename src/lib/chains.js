/**
 * Chain / token configuration.
 *
 * These are sane, working defaults so the gateway functions out of the box:
 *  - USDC / USDT are checked as ERC-20 transfers on Ethereum mainnet
 *  - ETH is checked as a native transfer on Ethereum mainnet
 *  - BTC is checked on the Bitcoin mainnet
 *  - TON is checked on the TON mainnet
 *
 * Every value here can be overridden per-request when calling verifyPayment(),
 * so you can point USDC/USDT/ETH at Base, Polygon, Arbitrum, etc. instead —
 * just swap tokenAddress / rpcUrl / chainId for the network you settle on.
 */

export const COINS = ['USDC', 'USDT', 'BTC', 'ETH', 'TON'];

export const COIN_META = {
  USDC: { label: 'USDC', color: '#2775CA', decimals: 6, coingeckoId: 'usd-coin' },
  USDT: { label: 'USDT', color: '#26A17B', decimals: 6, coingeckoId: 'tether' },
  BTC: { label: 'BTC', color: '#F7931A', decimals: 8, coingeckoId: 'bitcoin' },
  ETH: { label: 'ETH', color: '#627EEA', decimals: 18, coingeckoId: 'ethereum' },
  TON: { label: 'TON', color: '#0098EA', decimals: 9, coingeckoId: 'the-open-network' },
};

// Default public JSON-RPC endpoint (no API key required) used for ERC-20 log scans.
export const DEFAULT_ETH_RPC = 'https://ethereum.publicnode.com';

// keccak256("Transfer(address,address,uint256)") — standard ERC-20 event topic.
export const ERC20_TRANSFER_TOPIC =
  '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

// Ethereum mainnet token contracts (override via verifyPayment({ tokenAddress }) for other chains).
export const ERC20_CONTRACTS = {
  USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
};

export const BLOCKSTREAM_API = 'https://blockstream.info/api';
export const TONCENTER_API = 'https://toncenter.com/api/v2';
export const ETHERSCAN_API = 'https://api.etherscan.io/v2/api';
