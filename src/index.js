import HLDeepResearchAgent from "./agent.js";
import { dirname, resolve } from "path";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";

import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const agentsConfig = JSON.parse(
  readFileSync(resolve(__dirname, "agentConfig.json"), "utf8")
);
const DEBUG = process.env.DEBUG === "TRUE";

const config = {
  agentDataDir: "./data",
  loopInterval: 600000, // 10 mins
  errorSleepTime: 60000, // 1 min
  retryLimit: 1,
  telegram: DEBUG ? false : true,
};

const loop = async () => {
  console.log(`[HLDR-AGENT] Initializing...`);
  const agentsInstances = [];
  for (const agentId in agentsConfig) {
    const agent = { agentId, ...agentsConfig[agentId] };
    const agentInstance = new HLDeepResearchAgent(agent, config);
    agentsInstances.push(agentInstance);
  }

  console.log(
    `[HLDR-AGENT] Initialized ${agentsInstances.length} agents instance.`
  );

  // Implement the main loop here instead of in agent.js
  while (true) {
    for (const agent of agentsInstances) {
      console.log(`[HLDR-AGENT] Running agent: ${agent.config.agentId}`);
      console.log(`[Debug] Running agent: ${agent.agentId}`);
      await agent.runOnce(); // error are retry inside agent
    }
    console.log(
      `[HLDR-AGENT] Sleeping for ${config.loopInterval / 1000} seconds...`
    );
    await new Promise((resolve) => setTimeout(resolve, config.loopInterval));
  }
};

loop();
