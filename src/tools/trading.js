import {
  updateLeverageAndPlaceOrder,
  closePositions,
} from "../api/hyperliquid/exchange.js";

// todo parameters to be compatible with openai function calling
const trading = [
  {
    type: "function",
    function: {
      fn: closePositions,
      name: "closePositions",
      description:
        "Close position for coins. Can include multiple coins. ALWAYS use double quotes.",
      usage: `Usage: 
  <closePositions>
  [{"coin": "BTC-USD"}]
  </closePositions>
    `,
    },
  },
  {
    type: "function",
    function: {
      fn: updateLeverageAndPlaceOrder,
      name: "placeOrders",
      description:
        "Place order for coins, Can include multiple coins. ALWAYS use double quotes.",
      usage: `Usage: 
<placeOrders>
  [{
    "coin": "BTC-PERP",
    "side": "long/short",
    "leverage": "1",
    "entry": "10000",
    "takeProfit": "11000",
    "stopLoss": "9000",
    "size": "0.001",
    "reason": "60 words reason"
  }]
</placeOrders>
  `,
    },
  },
];

export default trading;
