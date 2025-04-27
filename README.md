## About the Repository

The name **clean** was chosen after many unsuccessful attempts to configure and make the project work correctly. Once the solution was found using **OpenRouter** and the project was verified to function as intended, the decision was made to create a new, clean repository.

This repository was created with the goal of providing clarity in the code, ease of understanding, and an improved structure for the project.

# Hyperliquid Deepresearch Agent

## Overview

An autonomous trading agent for Hyperliquid that combines deep research with automated execution. The agent:

- Conducts thorough market research using OpenRouter API with GPT-based models
- Analyzes market sentiment and directional bias
- Evaluates sector-specific opportunities (e.g., DeFi, L1s, AI)
- Identifies promising assets aligned with market conditions
- Implements technical analysis for entry/exit strategies
- Manages position sizing and risk
- Executes trades automatically
- Push notifications via Telegram

## Key Features

### RAG-Enhanced Decision Making

- Learns from historical research data
- Tracks performance of past coin selections
- Incorporates historical trade PnL for strategy refinement

### Models Used
The agent leverages the **OpenRouter API** with models such as:
- `gpt-4-turbo`: Used for advanced market research and sentiment analysis
- `gpt-3.5-turbo`: Used for faster, cost-efficient research tasks
- Additional models can be configured via the `agentConfig.json` file.

### Current Limitations

- Uses custom AI integration (no native OpenAI function calling)
- Research costs can be significant
- Simple JSON-based data storage
- Built in JavaScript (for better or worse 😉)

### Roadmap

- Portfolio performance monitoring
- Enhanced agent customization options
  - Adjustable research frequency

## Setup Requirements

### API Keys

To enable the agent's features, you'll need to configure the following API keys in a `.env` file or equivalent:

- **OpenRouter API**:
  - `OPENROUTER_API_KEY`: Your OpenRouter API key for accessing GPT-based models.
  - `BASE_URL`: The base URL for the API, typically `https://openrouter.ai/api/v1`.
  - `MODEL_NAME`: The model to use, e.g., `gpt-4-turbo` or `gpt-3.5-turbo`.

- **Hyperliquid API**:
  - `HYPERLIQUID_API_PRIVATE_KEY_<AGENT_ID>`: Private API key for the agent.
  - `HYPERLIQUID_API_ADDRESS_<AGENT_ID>`: The trading account address for the corresponding agent.

- **Telegram Bot**:
  - `TELEGRAM_CHAT_ID`: Your Telegram chat ID to receive notifications.
  - `TELEGRAM_BOT_TOKEN`: Your Telegram bot token.

- **Webserver API**:
  - `WEBSERVER_API_KEY`: API key for authenticating webserver requests.

### Environment Variables

```env
# Environment Variables Configuration

# === GENERAL CONFIGURATION ===
ISMAINNET=true

# === AI PROVIDER ===
OPENROUTER_API_KEY=<your-openrouter-api-key>
BASE_URL=https://openrouter.ai/api/v1
MODEL_NAME=gpt-3.5-turbo

# === HYPERLIQUID CONFIGURATION ===
HYPERLIQUID_API_PRIVATE_KEY_HL_AGENT_01=<your-private-key-for-agent-01>
HYPERLIQUID_API_ADDRESS_HL_AGENT_01=<your-address-for-agent-01>
HYPERLIQUID_API_PRIVATE_KEY_HL_AGENT_02=<your-private-key-for-agent-02>
HYPERLIQUID_API_ADDRESS_HL_AGENT_02=<your-address-for-agent-02>

# === TELEGRAM CONFIGURATION ===
TELEGRAM_CHAT_ID=<your-telegram-chat-id>
TELEGRAM_BOT_TOKEN=<your-telegram-bot-token>

# === WEBSERVER CONFIGURATION ===
WEBSERVER_API_KEY=<your-webserver-api-key>
```

---

## Configuration

### Agent Config (`src/agentConfig.json`)

Configure multiple agents with different strategies, key name is agent's unique ID, which is also used as file path.

- `agentName`: Your agent's name
- `researchModel`: Research AI model (e.g., `gpt-4-turbo`, `gpt-3.5-turbo`)
- `tradeModel`: Trading AI model
- `sectors`: Target sectors for trading
- `persona`: Trading style and risk profile
- `tradeFrequency`: Trade interval in ms
- `researchParams`:
  - `coinLookupLimit`: Max coins to research
  - `identifyCoinLimit`: Coins to shortlist
  - `ragLookupLimit`: Historical data points to consider
- `tradeParams`:
  - `orderLookupLimit`: Order history depth
- `maxLeverage`: Leverage ceiling
- `minOrderSize`: Minimum trade size (USD)

### Agent Secret (`src/agentSecret.json`)

Security configuration for each agent:

- `accountAddress`: Your Hyperliquid trading account
- `privateKey`: Mainnet API key
- `privateKeyTestnet`: Testnet API key

**Important Note**: The private keys are API keys generated from the [Hyperliquid API Portal](https://app.hyperliquid.xyz/api), not wallet private keys. These grant your agent trading permissions on your specified account.

---

## Quick Start

### Install dependencies:

```bash
pnpm install
```

### Start the trading agent(s):

```bash
node src/index.js
```

- This launches the main agent loop which:
  - Manages multiple agent instances
  - Conducts market research
  - Executes trading strategies
  - Sends notifications (if configured)

### (Optional) Start the performance monitoring webserver:

```bash
node webserver/server.js
```

- This enables:
  - Remote performance monitoring via SuperiorAgents.com
  - Secured access through API key authentication
  - Default port: 3000

### Monitoring Your Agents

- Check console logs for real-time updates
- Monitor Telegram notifications (if configured)
