import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { BrowserProvider, formatEther } from "ethers";
import { SEISMIC_TESTNET } from "@/config/chain";
import { useToast } from "@/hooks/use-toast";

interface WalletContextType {
  address: string | null;
  balance: string;
  chainId: number | null;
  isConnecting: boolean;
  isCorrectNetwork: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: () => Promise<void>;
  provider: BrowserProvider | null;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  balance: "0",
  chainId: null,
  isConnecting: false,
  isCorrectNetwork: false,
  connect: async () => {},
  disconnect: () => {},
  switchNetwork: async () => {},
  provider: null,
});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState("0");
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const { toast } = useToast();

  const isCorrectNetwork = chainId === SEISMIC_TESTNET.chainId;

  const updateBalance = useCallback(async (addr: string, prov: BrowserProvider) => {
    try {
      const bal = await prov.getBalance(addr);
      setBalance(parseFloat(formatEther(bal)).toFixed(4));
    } catch {
      setBalance("0");
    }
  }, []);

  const connect = useCallback(async () => {
    if (!(window as any).ethereum) {
      toast({
        title: "MetaMask not found",
        description: "Please install MetaMask to use this dApp.",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    try {
      const ethereum = (window as any).ethereum;
      const prov = new BrowserProvider(ethereum);
      const accounts = await prov.send("eth_requestAccounts", []);
      const network = await prov.getNetwork();

      setProvider(prov);
      setAddress(accounts[0]);
      setChainId(Number(network.chainId));
      await updateBalance(accounts[0], prov);

      toast({
        title: "Wallet Connected",
        description: `${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
      });
    } catch (err: any) {
      toast({
        title: "Connection Failed",
        description: err.message || "Could not connect wallet",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  }, [toast, updateBalance]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setBalance("0");
    setChainId(null);
    setProvider(null);
    toast({ title: "Wallet Disconnected" });
  }, [toast]);

  const switchNetwork = useCallback(async () => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) return;

    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEISMIC_TESTNET.chainIdHex }],
      });
    } catch (switchError: any) {
      // Chain not added, try adding it
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: SEISMIC_TESTNET.chainIdHex,
                chainName: SEISMIC_TESTNET.name,
                nativeCurrency: SEISMIC_TESTNET.nativeCurrency,
                rpcUrls: [SEISMIC_TESTNET.rpcUrl],
                blockExplorerUrls: [SEISMIC_TESTNET.blockExplorer],
              },
            ],
          });
        } catch {
          toast({
            title: "Network Error",
            description: "Failed to add Seismic Testnet",
            variant: "destructive",
          });
        }
      }
    }
  }, [toast]);

  // Listen for account/chain changes
  useEffect(() => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAddress(accounts[0]);
        if (provider) updateBalance(accounts[0], provider);
      }
    };

    const handleChainChanged = (newChainId: string) => {
      setChainId(parseInt(newChainId, 16));
      window.location.reload();
    };

    ethereum.on("accountsChanged", handleAccountsChanged);
    ethereum.on("chainChanged", handleChainChanged);

    return () => {
      ethereum.removeListener("accountsChanged", handleAccountsChanged);
      ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [disconnect, provider, updateBalance]);

  return (
    <WalletContext.Provider
      value={{ address, balance, chainId, isConnecting, isCorrectNetwork, connect, disconnect, switchNetwork, provider }}
    >
      {children}
    </WalletContext.Provider>
  );
};
