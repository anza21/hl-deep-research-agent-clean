# Hyperliquid Deepresearch Agent

## Overview

An autonomous trading agent for Hyperliquid that combines deep research with automated execution. The agent:

- Conducts thorough market research using Perplexity AI
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

- Perplexity API (required for market research)
- Hyperliquid API keys (for market data and trading)
- Telegram (optional for notifications)

### Environment Variables

```env
ISMAINNET=TRUE/FALSE
PERPLEXITY_API_KEY=<your-key>
TELEGRAM_CHAT_ID=<your-chat-id>
TELEGRAM_BOT_TOKEN=<your-bot-token>
WEBSERVER_API_KEY=<your-api-key>  # For SuperiorAgents.com integration
```

### Webserver Integration

The agent includes a built-in API endpoint that allows [SuperiorAgents.com](https://superioragents.com/) to fetch performance metrics and trading statistics. This integration enables:

- Real-time performance monitoring
- Historical trade analysis
- Agent comparison and rankings

#### Authentication

The webserver uses API key authentication for secure access:

- Set `WEBSERVER_API_KEY` in your environment variables
- Include this key in the request header for all API calls
- Default port: 3000 (configurable)

#### API Endpoints

## Configuration

### Agent Config (`src/agentConfig.json`)

Configure multiple agents with different strategies, key name is agent's unique ID, which is also used as file path.

- `agentName`: Your agent's name
- `researchModel`: Research AI model
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
