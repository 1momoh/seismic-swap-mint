import { useState, useEffect } from "react";
import { TOKENS, Token, FAUCET_MAX_MINT, FAUCET_COOLDOWN_MS } from "@/config/chain";
import { useWallet } from "@/context/WalletContext";
import { Droplets, Loader2, Clock, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface CooldownInfo {
  lastMint: number;
  remaining: number;
}

const FaucetPanel = () => {
  const { address, isCorrectNetwork } = useWallet();
  const { toast } = useToast();
  const [mintingToken, setMintingToken] = useState<string | null>(null);
  const [cooldowns, setCooldowns] = useState<Record<string, CooldownInfo>>({});

  // Load cooldowns from localStorage
  useEffect(() => {
    if (!address) return;
    const stored = localStorage.getItem(`cooldowns_${address}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      const updated: Record<string, CooldownInfo> = {};
      const now = Date.now();
      Object.keys(parsed).forEach((sym) => {
        const remaining = Math.max(0, parsed[sym].lastMint + FAUCET_COOLDOWN_MS - now);
        updated[sym] = { lastMint: parsed[sym].lastMint, remaining };
      });
      setCooldowns(updated);
    }
  }, [address]);

  // Tick cooldowns
  useEffect(() => {
    const interval = setInterval(() => {
      setCooldowns((prev) => {
        const updated: Record<string, CooldownInfo> = {};
        const now = Date.now();
        Object.keys(prev).forEach((sym) => {
          const remaining = Math.max(0, prev[sym].lastMint + FAUCET_COOLDOWN_MS - now);
          updated[sym] = { lastMint: prev[sym].lastMint, remaining };
        });
        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms: number) => {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${h}h ${m}m ${s}s`;
  };

  const handleMint = async (token: Token) => {
    if (!address || !isCorrectNetwork) return;

    const cd = cooldowns[token.symbol];
    if (cd && cd.remaining > 0) {
      toast({
        title: "Cooldown Active",
        description: `Wait ${formatTime(cd.remaining)} before minting ${token.symbol} again.`,
        variant: "destructive",
      });
      return;
    }

    setMintingToken(token.symbol);
    // Simulate minting
    await new Promise((r) => setTimeout(r, 1500));

    // Update balances
    const balKey = `balances_${address}`;
    const balances = JSON.parse(localStorage.getItem(balKey) || "{}");
    balances[token.symbol] = (balances[token.symbol] || 0) + FAUCET_MAX_MINT;
    localStorage.setItem(balKey, JSON.stringify(balances));

    // Update cooldowns
    const now = Date.now();
    const newCooldowns = {
      ...cooldowns,
      [token.symbol]: { lastMint: now, remaining: FAUCET_COOLDOWN_MS },
    };
    setCooldowns(newCooldowns);
    const cooldownStore: Record<string, { lastMint: number }> = {};
    Object.keys(newCooldowns).forEach((sym) => {
      cooldownStore[sym] = { lastMint: newCooldowns[sym].lastMint };
    });
    localStorage.setItem(`cooldowns_${address}`, JSON.stringify(cooldownStore));

    toast({
      title: "Tokens Minted!",
      description: `${FAUCET_MAX_MINT} ${token.symbol} added to your wallet.`,
    });

    setMintingToken(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-5">
          <Droplets className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Test Token Faucet</h2>
        </div>

        {!address && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Connect your wallet to mint test tokens
          </div>
        )}

        {address && !isCorrectNetwork && (
          <div className="text-center py-8 text-warning text-sm">
            Switch to Seismic Testnet to use the faucet
          </div>
        )}

        {address && isCorrectNetwork && (
          <div className="space-y-3">
            {TOKENS.map((token, i) => {
              const cd = cooldowns[token.symbol];
              const onCooldown = cd && cd.remaining > 0;
              const isMinting = mintingToken === token.symbol;

              return (
                <motion.div
                  key={token.symbol}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/30 border border-border/30"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground"
                      style={{ background: token.color }}
                    >
                      {token.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">{token.symbol}</p>
                      <p className="text-xs text-muted-foreground">{token.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {onCooldown && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(cd.remaining)}
                      </span>
                    )}
                    <button
                      onClick={() => handleMint(token)}
                      disabled={isMinting || !!onCooldown}
                      className="px-4 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                    >
                      {isMinting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : onCooldown ? (
                        <CheckCircle className="w-3.5 h-3.5" />
                      ) : (
                        `Mint ${FAUCET_MAX_MINT}`
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}

            <p className="text-xs text-muted-foreground text-center mt-4">
              Max {FAUCET_MAX_MINT} tokens per mint • 24h cooldown per token
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default FaucetPanel;
