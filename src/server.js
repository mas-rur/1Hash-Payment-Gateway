import { COIN_META, ERC20_CONTRACTS, DEFAULT_ETH_RPC } from './lib/chains.js';
import { getUsdPrice } from './lib/price.js';
import { verifyErc20Transfer } from './lib/verify/erc20.js';
import { verifyEthNative } from './lib/verify/eth.js';
import { verifyBtcPayment } from './lib/verify/btc.js';
import { verifyTonPayment } from './lib/verify/ton.js';

/**
 * verifyPayment — checks a public blockchain/explorer for a matching incoming payment.
 *
 * Call this from your own API route (see example/app/api/verify-payment/route.js).
 * It never needs your private keys — only the merchant's *receiving* address for
 * the chosen coin, which is public information.
 *
 * @param {Object} params
 * @param {'USDC'|'USDT'|'BTC'|'ETH'|'TON'} params.coin
 * @param {string} params.payerAddress    - wallet address the customer says they paid from
 * @param {string} params.merchantAddress - your receiving address for that coin
 * @param {number} params.amountUsd       - the price the customer was shown, in USD
 * @param {number} [params.toleranceUsd]  - how many cents lower than amountUsd still counts
 *                                          as paid (covers price-feed drift / rounding). Default 0.05.
 * @param {number} [params.checkoutStartedAt] - ms timestamp; ignores older transactions. Default: 1h ago.
 * @param {string} [params.rpcUrl]        - override the ETH RPC endpoint (e.g. to check Base/Polygon)
 * @param {string} [params.tokenAddress]  - override the ERC-20 contract address for USDC/USDT
 * @param {string} [params.etherscanApiKey] - required for native ETH verification
 * @param {string} [params.tonApiKey]     - optional, raises Toncenter rate limits
 */
export async function verifyPayment({
  coin,
  payerAddress,
  merchantAddress,
  amountUsd,
  toleranceUsd = 0.05,
  checkoutStartedAt = Date.now() - 60 * 60 * 1000,
  rpcUrl,
  tokenAddress,
  etherscanApiKey,
  tonApiKey,
}) {
  if (!COIN_META[coin]) {
    return { verified: false, error: `Unsupported coin: ${coin}` };
  }
  if (!payerAddress || !merchantAddress || !amountUsd) {
    return { verified: false, error: 'Missing payerAddress, merchantAddress or amountUsd' };
  }

  let price;
  try {
    price = await getUsdPrice(coin);
  } catch (err) {
    return { verified: false, error: err.message };
  }

  const minUsd = Math.max(amountUsd - toleranceUsd, 0);
  const minAmountCrypto = minUsd / price;

  try {
    switch (coin) {
      case 'USDC':
      case 'USDT': {
        const result = await verifyErc20Transfer({
          rpcUrl: rpcUrl || DEFAULT_ETH_RPC,
          tokenAddress: tokenAddress || ERC20_CONTRACTS[coin],
          fromAddress: payerAddress,
          toAddress: merchantAddress,
          minAmount: minAmountCrypto,
          decimals: COIN_META[coin].decimals,
        });
        return { ...result, coin, price, minAmountCrypto };
      }
      case 'ETH': {
        const result = await verifyEthNative({
          apiKey: etherscanApiKey,
          fromAddress: payerAddress,
          toAddress: merchantAddress,
          minAmountEth: minAmountCrypto,
          sinceTimestamp: checkoutStartedAt,
        });
        return { ...result, coin, price, minAmountCrypto };
      }
      case 'BTC': {
        const result = await verifyBtcPayment({
          payerAddress,
          toAddress: merchantAddress,
          minAmountBtc: minAmountCrypto,
        });
        return { ...result, coin, price, minAmountCrypto };
      }
      case 'TON': {
        const result = await verifyTonPayment({
          payerAddress,
          toAddress: merchantAddress,
          minAmountTon: minAmountCrypto,
          apiKey: tonApiKey,
        });
        return { ...result, coin, price, minAmountCrypto };
      }
      default:
        return { verified: false, error: `Unsupported coin: ${coin}` };
    }
  } catch (err) {
    return { verified: false, error: err.message, coin, price, minAmountCrypto };
  }
}

export { COIN_META, ERC20_CONTRACTS } from './lib/chains.js';
export { getUsdPrice } from './lib/price.js';
