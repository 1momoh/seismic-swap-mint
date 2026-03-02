import { useState, useEffect, useMemo, useCallback } from "react";
import { TOKENS, Token, calculateSwapOutput } from "@/config/chain";
import { CONTRACT_ADDRESSES, ERC20_ABI, SWAP_ABI } from "@/config/contracts";
import { useWallet } from "@/context/WalletContext";
import TokenSelector from "@/components/TokenSelector";
import { ArrowDownUp, Loader2, AlertTriangle, Fuel } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Contract, parseUnits, formatUnits } from "ethers";

const SwapPanel = () => {
  const { address, isCorrectNetwork, provider } = useWallet();
  const { toast } = useToast();
  const [tokenIn, setTokenIn] = useState<Token>(TOKENS[0]);
  const [tokenOut, setTokenOut] = useState<Token>(TOKENS[1]);
  const [amountIn, setAmountIn] = useState("");
  const [isSwapping, setIsSwapping] = useState(false);
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);

  const slippage = 0.005;

  // Fetch on-chain balances for all tokens
  const fetchBalances = useCallback(async () => {
    if (!address || !provider) return;
    setIsLoadingBalances(true);
    try {
      const signer = await provider.getSigner();
      const results: Record<string, string> = {};
      await Promise.all(
        TOKENS.map(async (token) => {
          try {
            const contract = new Contract(token.address, ERC20_ABI, signer);
            const bal = await contract.balanceOf(address);
            results[token.symbol] = formatUnits(bal, token.decimals);
          } catch {
            results[token.symbol] = "0";
          }
        })
      );
      setBalances(results);
    } catch {
      // silent
    } finally {
      setIsLoadingBalances(false);
    }
  }, [address, provider]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  const swapResult = useMemo(() => {
    const val = parseFloat(amountIn);
    if (!val || val <= 0) return null;
    return calculateSwapOutput(val, tokenIn.symbol, tokenOut.symbol, slippage);
  }, [amountIn, tokenIn, tokenOut]);

  const inputBalance = parseFloat(balances[tokenIn.symbol] || "0");
  const insufficientBalance = parseFloat(amountIn) > inputBalance;

  const canSwap =
    address && isCorrectNetwork && amountIn && parseFloat(amountIn) > 0 && !insufficientBalance && !isSwapping;

  const handleFlip = () => {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setAmountIn("");
  };

  const handleSwap = async () => {
    if (!canSwap || !swapResult || !provider) return;
    setIsSwapping(true);

    try {
      const signer = await provider.getSigner();
      const amountInWei = parseUnits(amountIn, tokenIn.decimals);

      // Approve tokenIn for the Swap contract
      const tokenInContract = new Contract(tokenIn.address, ERC20_ABI, signer);
      const allowance = await tokenInContract.allowance(address, CONTRACT_ADDRESSES.SWAP);
      if (allowance < amountInWei) {
        const approveTx = await tokenInContract.approve(CONTRACT_ADDRESSES.SWAP, amountInWei);
        toast({ title: "Approving...", description: `Approving ${tokenIn.symbol} for swap` });
        await approveTx.wait();
      }

      // Execute swap
      const swapContract = new Contract(CONTRACT_ADDRESSES.SWAP, SWAP_ABI, signer);
      const tx = await swapContract.swap(tokenIn.address, tokenOut.address, amountInWei);
      toast({ title: "Swapping...", description: "Transaction submitted, waiting for confirmation" });
      await tx.wait();

      toast({
        title: "Swap Successful!",
        description: `Swapped ${amountIn} ${tokenIn.symbol} → ${tokenOut.symbol}`,
      });

      setAmountIn("");
      await fetchBalances();
    } catch (err: any) {
      toast({
        title: "Swap Failed",
        description: err?.reason || err?.message || "Transaction failed",
        variant: "destructive",
      });
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-foreground">Swap</h2>
          <span className="text-xs text-muted-foreground px-2 py-1 rounded-lg bg-secondary/50">
            Slippage: {slippage * 100}%
          </span>
        </div>

        {/* Token In */}
        <div className="token-input-field mb-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">You pay</span>
            <span className="text-xs text-muted-foreground">
              Balance: {isLoadingBalances ? "..." : parseFloat(balances[tokenIn.symbol] || "0").toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              placeholder="0.0"
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
              className="flex-1 bg-transparent text-2xl font-semibold text-foreground outline-none placeholder:text-muted-foreground/40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <TokenSelector selected={tokenIn} onSelect={setTokenIn} disabledToken={tokenOut} />
          </div>
          {insufficientBalance && amountIn && (
            <p className="text-xs text-destructive mt-2 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Insufficient balance
            </p>
          )}
        </div>

        {/* Flip button */}
        <div className="flex justify-center -my-3 relative z-10">
          <button
            onClick={handleFlip}
            className="w-10 h-10 rounded-xl bg-secondary border-4 border-background flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all"
          >
            <ArrowDownUp className="w-4 h-4" />
          </button>
        </div>

        {/* Token Out */}
        <div className="token-input-field mt-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">You receive</span>
            <span className="text-xs text-muted-foreground">
              Balance: {isLoadingBalances ? "..." : parseFloat(balances[tokenOut.symbol] || "0").toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 text-2xl font-semibold text-foreground">
              {swapResult ? swapResult.amountOut.toFixed(4) : "0.0"}
            </div>
            <TokenSelector selected={tokenOut} onSelect={setTokenOut} disabledToken={tokenIn} />
          </div>
        </div>

        {/* Swap details */}
        {swapResult && (
          <div className="mt-4 p-3 rounded-xl bg-secondary/30 text-xs space-y-1.5">
            <div className="flex justify-between text-muted-foreground">
              <span>Rate</span>
              <span className="text-foreground">1 {tokenIn.symbol} = {swapResult.rate.toFixed(4)} {tokenOut.symbol}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Price Impact</span>
              <span className={swapResult.priceImpact > 1 ? "text-warning" : "text-success"}>
                {swapResult.priceImpact.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Min. Received</span>
              <span className="text-foreground">{swapResult.minReceived.toFixed(4)} {tokenOut.symbol}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span className="flex items-center gap-1"><Fuel className="w-3 h-3" /> Est. Gas</span>
              <span className="text-foreground">~0.0012 ETH</span>
            </div>
          </div>
        )}

        {/* Swap button */}
        <button
          onClick={handleSwap}
          disabled={!canSwap}
          className="w-full mt-4 py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-primary text-primary-foreground hover:opacity-90 glow-primary"
        >
          {isSwapping ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Swapping...
            </span>
          ) : !address ? (
            "Connect Wallet"
          ) : !isCorrectNetwork ? (
            "Switch Network"
          ) : insufficientBalance ? (
            "Insufficient Balance"
          ) : (
            "Swap"
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default SwapPanel;
