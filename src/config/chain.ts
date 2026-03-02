// Seismic Testnet chain configuration
export const SEISMIC_TESTNET = {
  chainId: 5124,
  chainIdHex: "0x1404",
  name: "Seismic Testnet",
  rpcUrl: "https://gcp-2.seismictest.net/rpc",
  wsUrl: "wss://gcp-2.seismictest.net/ws",
  blockExplorer: "https://seismic-testnet.socialscan.io",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  faucetUrl: "https://faucet.seismictest.net/",
};

// Test ERC20 tokens for the DEX
export interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  color: string;
}

// Mock token addresses (these would be real deployed contracts on Seismic Testnet)
export const TOKENS: Token[] = [
  {
    symbol: "SEIS",
    name: "Seismic Token",
    address: "0x26a41c14bbA8B80b2602e2B3C94b7baC068b8888",
    decimals: 18,
    color: "hsl(175, 80%, 50%)",
  },
  {
    symbol: "USDT",
    name: "Test USDT",
    address: "0x4c3503d0468408BE28b09A9bba762fF9E49e485b",
    decimals: 18,
    color: "hsl(145, 65%, 45%)",
  },
  {
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    address: "0x281E98c567cBda60976491b3D155c7fDD1A8339a",
    decimals: 18,
    color: "hsl(38, 90%, 55%)",
  },
  {
    symbol: "DAI",
    name: "Test DAI",
    address: "0xc2b842145331FAcc133627ba90c3f07ff5184862",
    decimals: 18,
    color: "hsl(45, 90%, 55%)",
  },
];

// Mock exchange rates (token -> ETH value for AMM pricing)
export const MOCK_PRICES: Record<string, number> = {
  SEIS: 0.5,
  USDT: 1.0,
  WBTC: 45000,
  DAI: 1.0,
};

// Calculate swap output with constant product AMM formula (x * y = k)
export function calculateSwapOutput(
  amountIn: number,
  tokenInSymbol: string,
  tokenOutSymbol: string,
  slippage: number = 0.005
): { amountOut: number; rate: number; priceImpact: number; minReceived: number } {
  const priceIn = MOCK_PRICES[tokenInSymbol] || 1;
  const priceOut = MOCK_PRICES[tokenOutSymbol] || 1;

  // Simple rate calculation
  const rate = priceIn / priceOut;
  const rawAmountOut = amountIn * rate;

  // Simulate price impact (0.3% fee + small impact)
  const fee = 0.003;
  const priceImpact = Math.min(amountIn * 0.001, 5); // max 5% impact
  const amountOut = rawAmountOut * (1 - fee) * (1 - priceImpact / 100);
  const minReceived = amountOut * (1 - slippage);

  return { amountOut, rate, priceImpact, minReceived };
}

// Faucet constants
export const FAUCET_MAX_MINT = 1000;
export const FAUCET_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours
