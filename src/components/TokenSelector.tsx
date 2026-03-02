import { Token, TOKENS } from "@/config/chain";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TokenSelectorProps {
  selected: Token;
  onSelect: (token: Token) => void;
  disabledToken?: Token;
}

const TokenSelector = ({ selected, onSelect, disabledToken }: TokenSelectorProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/80 hover:bg-secondary transition-colors text-sm font-semibold"
      >
        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-primary-foreground" style={{ background: selected.color }}>
          {selected.symbol[0]}
        </div>
        {selected.symbol}
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-full mt-1 left-0 w-48 glass-card p-1.5 z-50"
          >
            {TOKENS.map((token) => (
              <button
                key={token.symbol}
                disabled={disabledToken?.symbol === token.symbol}
                onClick={() => { onSelect(token); setOpen(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm hover:bg-secondary/60 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-primary-foreground" style={{ background: token.color }}>
                  {token.symbol[0]}
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">{token.symbol}</p>
                  <p className="text-xs text-muted-foreground">{token.name}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TokenSelector;
