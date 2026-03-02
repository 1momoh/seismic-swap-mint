import { useWallet } from "@/context/WalletContext";
import { SEISMIC_TESTNET } from "@/config/chain";
import { Wallet, ChevronDown, ExternalLink, LogOut, Copy } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const WalletButton = () => {
  const { address, balance, isConnecting, isCorrectNetwork, connect, disconnect, switchNetwork } = useWallet();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({ title: "Address Copied" });
    }
  };

  if (!address) {
    return (
      <button
        onClick={connect}
        disabled={isConnecting}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-50 glow-primary"
      >
        <Wallet className="w-4 h-4" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </button>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <button
        onClick={switchNetwork}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-destructive text-destructive-foreground font-semibold text-sm transition-all hover:opacity-90"
      >
        Switch to Seismic
      </button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card text-sm font-medium transition-all hover:border-primary/30"
      >
        <div className="w-2 h-2 rounded-full bg-success animate-pulse-glow" />
        <span className="font-mono text-foreground">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
      </button>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-64 glass-card p-3 z-50"
          >
            <div className="mb-3 pb-3 border-b border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Balance</p>
              <p className="text-lg font-semibold text-foreground">{balance} ETH</p>
            </div>

            <div className="space-y-1">
              <button
                onClick={copyAddress}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-secondary-foreground hover:bg-secondary/50 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" /> Copy Address
              </button>
              <a
                href={`${SEISMIC_TESTNET.blockExplorer}/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-secondary-foreground hover:bg-secondary/50 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> View on Explorer
              </a>
              <button
                onClick={() => { disconnect(); setMenuOpen(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" /> Disconnect
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WalletButton;
