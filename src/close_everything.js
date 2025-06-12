import { sdkAgents } from "./api/hyperliquid/init.js";

const agentId = "hl-agent-01"; // άλλαξε σε hl-agent-02 αν θέλεις
const sdk = sdkAgents[agentId];
await sdk.connect();
const wallet = sdk.custom.walletAddress;

// ✅ DEBUG: Show all positions
const clearing = await sdk.info.perpetuals.getClearinghouseState(wallet);
console.log("📊 Clearinghouse State:", JSON.stringify(clearing, null, 2));

const positions = clearing.assetPositions.filter(p => p.position.szi !== 0);
if (positions.length === 0) {
  console.log("✅ No open positions to close.");
} else {
  for (const pos of positions) {
    const coin = pos.position.coin;
    const size = Math.abs(pos.position.szi);
    const isBuy = pos.position.szi < 0; // Short ➝ Buy to close
    const mid = await sdk.info.getMid(coin);
    const order = {
      coin,
      is_buy: isBuy,
      sz: size,
      limit_px: mid,
      order_type: { limit: { tif: "Ioc" } },
      reduce_only: true,
    };
    const res = await sdk.exchange.placeOrder({ orders: [order] });
    console.log(`🔁 Closing ${coin} with ${size} units...`, res.response.data.statuses[0]);
  }
}
process.exit();
