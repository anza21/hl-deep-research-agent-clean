import { sdkAgents } from "./api/hyperliquid/init.js";

const agentId = "hl-agent-01";
const sdk = sdkAgents[agentId];
await sdk.connect();

const wallet = sdk.custom.walletAddress;

console.log(`🔍 Checking positions for ${wallet}...`);

const clearingHouseState = await sdk.info.perpetuals.getClearinghouseState(wallet);
console.log("🧠 Full clearing state:");
console.dir(clearingHouseState, { depth: null });

const openOrders = await sdk.info.getUserOpenOrders(wallet);
console.log("📦 Open Orders:", openOrders);
