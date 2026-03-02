import { useState } from "react";
import WalletButton from "@/components/WalletButton";
import NetworkBadge from "@/components/NetworkBadge";
import SwapPanel from "@/components/SwapPanel";
import FaucetPanel from "@/components/FaucetPanel";
import InfoPanel from "@/components/InfoPanel";
import { ArrowLeftRight, Droplets, Info, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

type Tab = "swap" | "faucet" | "info";

const DEXLayout = () => {
  const [activeTab, setActiveTab] = useState<Tab>("swap");

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "swap", label: "Swap", icon: <ArrowLeftRight className="w-4 h-4" /> },
    { id: "faucet", label: "Faucet", icon: <Droplets className="w-4 h-4" /> },
    { id: "info", label: "Info", icon: <Info className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-accent/5 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-5 py-4 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <ArrowLeftRight className="w-4 h-4 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-bold gradient-text">SaySeismicSwap</h1>
        </div>

        <div className="flex items-center gap-3">
          <NetworkBadge />
          <WalletButton />
        </div>
      </header>

      {/* Testnet Banner */}
      <div className="relative z-10 mx-auto max-w-md mt-4 px-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-warning/5 border border-warning/15 text-xs text-warning">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>Testnet only — tokens have no real value</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="relative z-10 flex justify-center mt-6 mb-6 px-4">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-secondary/40 border border-border/30">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="tab-bg"
                  className="absolute inset-0 rounded-lg bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.icon}</span>
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="relative z-10 px-4 pb-8">
        {activeTab === "swap" && <SwapPanel />}
        {activeTab === "faucet" && <FaucetPanel />}
        {activeTab === "info" && <InfoPanel />}
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-4 text-xs text-muted-foreground border-t border-border/20">
        Built on Seismic Testnet • Educational Purpose Only
      </footer>
    </div>
  );
};

export default DEXLayout;
