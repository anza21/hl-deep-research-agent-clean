import { updateLeverageAndPlaceOrder } from "./src/api/hyperliquid/exchange.js";

(async () => {
  const agentId = "hl-agent-01"; // Αντικατάστησε με το σωστό agentId
  const params = {
    coin: "BTC-PERP",
    side: "long",
    entry: 30000,
    takeProfit: 31000,
    stopLoss: 29000,
    size: 0.001,
    leverage: 2,
  };

  const result = await updateLeverageAndPlaceOrder(params, agentId);
  console.log(result);
})();
