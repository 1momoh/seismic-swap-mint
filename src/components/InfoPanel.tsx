import { SEISMIC_TESTNET, TOKENS, MOCK_PRICES } from "@/config/chain";
import { ExternalLink, Globe, Coins, Shield } from "lucide-react";
import { motion } from "framer-motion";

const InfoPanel = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="glass-card p-5 space-y-5">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Network Info</h2>
        </div>

        <div className="space-y-2.5">
          {[
            ["Network", SEISMIC_TESTNET.name],
            ["Chain ID", String(SEISMIC_TESTNET.chainId)],
            ["RPC", SEISMIC_TESTNET.rpcUrl],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">{label}</span>
              <span className="text-foreground font-mono text-xs truncate max-w-[200px]">{value}</span>
            </div>
          ))}

          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Explorer</span>
            <a
              href={SEISMIC_TESTNET.blockExplorer}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline text-xs flex items-center gap-1"
            >
              View <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Native Faucet</span>
            <a
              href={SEISMIC_TESTNET.faucetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline text-xs flex items-center gap-1"
            >
              Get ETH <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="border-t border-border/50 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Coins className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Token Prices (Mock)</h3>
          </div>
          <div className="space-y-2">
            {TOKENS.map((token) => (
              <div key={token.symbol} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-primary-foreground"
                    style={{ background: token.color }}
                  >
                    {token.symbol[0]}
                  </div>
                  <span className="text-foreground">{token.symbol}</span>
                </div>
                <span className="text-muted-foreground font-mono">${MOCK_PRICES[token.symbol]?.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border/50 pt-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-warning" />
            <h3 className="text-sm font-semibold text-warning">Testnet Disclaimer</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This is a testnet-only application for educational purposes. All tokens are mock tokens with no real value. 
            Never use real funds on this platform. Smart contract interactions are simulated.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default InfoPanel;
