import { sdkAgents } from "./init.js";
import { normaliseDecimals } from "./utils.js";

const MIN_ORDER_VALUE = 10; // Minimum order value in $

/**
 * Close a position on HyperLiquid
 * @param {String[]} coins - coins to close, e.g. ["BTC-PERP", "ETH-PERP"]
 * @returns {Promise<Object>} - order response
 */
const closePositions = async (coins = [], agentId) => {
  const sdk = sdkAgents[agentId];
  const results = [];
  // Ensure coins is an array
  const coinsArray = Array.isArray(coins) ? coins : [coins];

  const clearingHouseState = await sdk.info.perpetuals.getClearinghouseState(
    sdk.custom.walletAddress
  );
  const coinPositions = {};
  for (const position of clearingHouseState.assetPositions) {
    coinPositions[position.position.coin] = position;
  }

  const allMids = await sdk.info.getAllMids();
  const allMetas = await sdk.info.perpetuals.getMeta();

  for (const object of coinsArray) {
    let coin = object.coin;
    if (!coin.endsWith("-PERP")) coin = `${coin}-PERP`;

    const position = coinPositions[coin];
    if (position) {
      const midPrice = allMids[coin];
      const coinMeta = allMetas.universe.find((c) => c.name === coin);
      const currentIsShort = position.position.szi < 0;
      const order = {
        coin,
        is_buy: currentIsShort,
        sz: Math.abs(position.position.szi),
        limit_px: normaliseDecimals(
          midPrice * (currentIsShort ? 1.01 : 0.99),
          "px",
          coinMeta.szDecimals
        ),
        order_type: { limit: { tif: "Gtc" } },
        reduce_only: false,
      };

      try {
        const result = await sdk.exchange.placeOrder({
          orders: [order],
          grouping: "na",
        });
        results.push(result.response.data.statuses[0]);
      } catch (error) {
        console.log(error);
        console.log(order);
      }
    } else {
      results.push(`No position found for ${coin}`);
    }
  }
  return results;
};

/**
 * Update leverage and place an order on HyperLiquid
 * @param {Object} params - parameters for the order
 * @param {String} params.coin - coin to trade, e.g. "BTC-PERP" or "BTC"
 * @param {"long" | "short"} params.side - "long" or "short"
 * @param {Number} params.entry - entry price
 * @param {Number} params.takeProfit - take profit price
 * @param {Number} params.stopLoss - stop loss price
 * @param {Number} params.size - size of the order
 * @param {Number=} params.leverage - new leverage
 * @returns {Promise<Object>} - order response
 */
const updateLeverageAndPlaceOrder = async (
  { coin, side, entry, takeProfit, stopLoss, size, leverage },
  agentId
) => {
  // check if all arguments are provided
  if (!coin || !side || !entry || !takeProfit || !stopLoss || !size) {
    return "Missing arguments";
  }
  if (!coin.endsWith("-PERP")) coin = `${coin}-PERP`;
  if (!leverage) leverage = 1;

  const sdk = sdkAgents[agentId];

  const openOrders = await sdk.info.getUserOpenOrders(
    sdk.custom.walletAddress,
    false
  );
  for (const order of openOrders) {
    if (order.coin === coin) {
      return "There exist open orders for this coin";
    }
  }

  const clearingHouseState = await sdk.info.perpetuals.getClearinghouseState(
    sdk.custom.walletAddress
  );
  const positions = clearingHouseState.assetPositions;
  for (const position of positions) {
    if (position.position.coin === coin) {
      return "There exist open positions for this coin";
    }
  }

  const meta = await sdk.info.perpetuals.getMeta();
  const coinMeta = meta.universe.find((c) => c.name === coin);

  if (!coinMeta) return "Coin not found";
  // Convert leverage to integer and floor it if necessary
  leverage = Math.min(Math.floor(parseInt(leverage, 10)), coinMeta.maxLeverage);

  if (leverage < 1)
    return `Invalid leverage for this coin. Min: 1, Max: ${coinMeta.maxLeverage}`;

  await sdk.exchange.updateLeverage(coin, "cross", leverage);

  size = normaliseDecimals(size, "sz", coinMeta.szDecimals);
  entry = normaliseDecimals(entry, "px", coinMeta.szDecimals);
  takeProfit = normaliseDecimals(takeProfit, "px", coinMeta.szDecimals);
  stopLoss = normaliseDecimals(stopLoss, "px", coinMeta.szDecimals);

  // Ensure the order value meets the minimum requirement
  const orderValue = size * entry; // Assuming entry price is in $
  if (orderValue < MIN_ORDER_VALUE) {
    return `Order value too small. Minimum required is $${MIN_ORDER_VALUE}. Current value: $${orderValue}`;
  }

  const mainOrder = {
    coin,
    is_buy: side === "long",
    sz: size,
    limit_px: entry,
    order_type: { limit: { tif: "Gtc" } },
    reduce_only: false,
  };

  const tpOrder = {
    coin,
    is_buy: side === "short",
    sz: size,
    limit_px: normaliseDecimals(
      side === "long" ? takeProfit * 0.9 : takeProfit * 1.1,
      "px",
      coinMeta.szDecimals
    ),
    order_type: {
      trigger: {
        triggerPx: takeProfit,
        isMarket: true,
        tpsl: "tp",
      },
    },
    reduce_only: true,
  };

  // stop loss order
  const slOrder = {
    coin,
    is_buy: side === "short",
    sz: size,
    limit_px: normaliseDecimals(
      side === "long" ? stopLoss * 0.9 : stopLoss * 1.1,
      "px",
      coinMeta.szDecimals
    ),
    order_type: {
      trigger: {
        triggerPx: stopLoss,
        isMarket: true,
        tpsl: "sl",
      },
    },
    reduce_only: true,
  };

  const result = await sdk.exchange.placeOrder({
    orders: [mainOrder, tpOrder, slOrder],
    grouping: "normalTpsl",
  });

  console.log(result.response.data.statuses);

  return result.response.data.statuses[0];
};

export { closePositions, updateLeverageAndPlaceOrder };
