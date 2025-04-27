import { Hyperliquid } from "hyperliquid";
import { dirname, resolve } from "path";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const agentsConfigs = JSON.parse(
  readFileSync(resolve(__dirname, "..", "..", "agentConfig.json"), "utf-8")
);
const agentSecret = JSON.parse(
  readFileSync(resolve(__dirname, "..", "..", "agentSecret.json"), "utf-8")
);
const sdkAgents = {};

for (const agentId in agentsConfigs) {
  const secrets = agentSecret[agentId];
  if (!secrets) {
    throw new Error(`Secrets not provided for ${agentId}`);
  }

  const privateKey =
    process.env.ISMAINNET === "TRUE"
      ? secrets.privateKey
      : secrets.privateKeyTestnet;
  const walletAddress = secrets.accountAddress;

  if (!privateKey || !walletAddress)
    throw new Error(`Environment variables not provided for ${agentId}`);

  sdkAgents[agentId] = new Hyperliquid({
    enableWs: false,
    privateKey,
    testnet: process.env.ISMAINNET !== "TRUE",
    walletAddress,
  });
  try {
    await sdkAgents[agentId].connect();
    console.log(`✅ Connected Hyperliquid agent: ${agentId}`);
  } catch (err) {
    console.error(`❌ Failed to connect Hyperliquid agent: ${agentId}`);
    console.error(err.message);
  }

}

export { sdkAgents };
