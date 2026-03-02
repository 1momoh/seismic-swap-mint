import { SEISMIC_TESTNET } from "@/config/chain";
import { Activity } from "lucide-react";
import { useWallet } from "@/context/WalletContext";

const NetworkBadge = () => {
  const { isCorrectNetwork, chainId, address } = useWallet();

  if (!address) return null;

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
      isCorrectNetwork
        ? "bg-success/10 text-success border border-success/20"
        : "bg-destructive/10 text-destructive border border-destructive/20"
    }`}>
      <Activity className="w-3 h-3" />
      {isCorrectNetwork ? SEISMIC_TESTNET.name : `Wrong Network (${chainId})`}
    </div>
  );
};

export default NetworkBadge;
