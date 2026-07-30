import { COIN_META } from './chains.js';

const cache = new Map(); // coin -> { price, at }
const TTL_MS = 20_000; // don't hammer CoinGecko while a client is polling every few seconds

/**
 * Returns the current USD price of a coin using CoinGecko's public endpoint.
 * Results are cached for a few seconds since the verify endpoint may be polled repeatedly
 * during a single checkout.
 */
export async function getUsdPrice(coin) {
  const meta = COIN_META[coin];
  if (!meta) throw new Error(`Unsupported coin: ${coin}`);

  const cached = cache.get(coin);
  if (cached && Date.now() - cached.at < TTL_MS) return cached.price;

  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${meta.coingeckoId}&vs_currencies=usd`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Price lookup failed for ${coin} (${res.status})`);
  const data = await res.json();
  const price = data?.[meta.coingeckoId]?.usd;
  if (!price) throw new Error(`No price returned for ${coin}`);

  cache.set(coin, { price, at: Date.now() });
  return price;
}
