import dotenv from "dotenv";

dotenv.config();

// Get the HyperLiquid API URL based on environment
const getApiUrl = () => {
  const isMainnet = process.env.ISMAINNET === "TRUE";
  const apiUrl = isMainnet
    ? "https://api.hyperliquid.xyz"
    : "https://api.hyperliquid-testnet.xyz";

  return `${apiUrl}/info`;
};

// Fetch data from HyperLiquid API
const fetchHyperliquidData = async (requestType, user) => {
  const infoURL = getApiUrl();

  try {
    const response = await fetch(infoURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: requestType,
        user: user,
      }),
    });

    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${requestType}:`, error);
    throw error;
  }
};

// Get all HyperLiquid data needed for the API
export const getHyperliquidData = async (walletAddress) => {
  const userAddress = walletAddress;

  try {
    // Fetch all required data in parallel
    const [userFills, clearinghouseState, openOrders, portfolio] =
      await Promise.all([
        fetchHyperliquidData("userFills", userAddress),
        fetchHyperliquidData("clearinghouseState", userAddress),
        fetchHyperliquidData("openOrders", userAddress),
        fetchHyperliquidData("portfolio", userAddress),
      ]);

    // Extract latest balance from portfolio data
    const latestBalance = portfolio
      .find((item) => item[0] === "perpAllTime")[1]
      .accountValueHistory.at(-1)[1];

    // Calculate PNL statistics for each interval
    const pnl = portfolio.map(([timeframe, data]) => {
      // Extract account value and PNL histories
      const accountValueHistory = data.accountValueHistory || [];
      const pnlHistory = data.pnlHistory || [];

      // Calculate average account value
      const avgAccountValue =
        accountValueHistory.length > 0
          ? accountValueHistory.reduce(
              (sum, [_, value]) => sum + parseFloat(value),
              0
            ) / accountValueHistory.length
          : 0;

      // Calculate average PNL
      const avgPnl =
        pnlHistory.length > 0
          ? pnlHistory.reduce((sum, [_, value]) => sum + parseFloat(value), 0) /
            pnlHistory.length
          : 0;

      // Calculate account value change (from first to last entry)
      const accountValueChange =
        accountValueHistory.length >= 2
          ? parseFloat(accountValueHistory[accountValueHistory.length - 1][1]) -
            parseFloat(accountValueHistory[0][1])
          : 0;

      // Calculate PNL change (from first to last entry)
      const pnlChange =
        pnlHistory.length >= 2
          ? parseFloat(pnlHistory[pnlHistory.length - 1][1]) -
            parseFloat(pnlHistory[0][1])
          : 0;

      // Return timeframe with calculated statistics
      return {
        timeframe,
        // data: data,
        stats: {
          avgAccountValue: avgAccountValue.toFixed(4),
          avgPnl: avgPnl.toFixed(4),
          accountValueChange: accountValueChange.toFixed(4),
          pnlChange: pnlChange.toFixed(4),
        },
      };
    });

    return {
      pnl: pnl,
      balance: latestBalance,
      trade_count: userFills.length,
      clearinghouseState: clearinghouseState,
      openOrders: openOrders,
    };
  } catch (error) {
    console.error("Error fetching HyperLiquid data:", error);
    throw error;
  }
};
