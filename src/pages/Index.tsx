import { WalletProvider } from "@/context/WalletContext";
import DEXLayout from "@/components/DEXLayout";

const Index = () => {
  return (
    <WalletProvider>
      <DEXLayout />
    </WalletProvider>
  );
};

export default Index;
