"use client";
import { getDataSuffix, submitReferral } from '@divvi/referral-sdk';
import { ClaimSDK, IdentitySDK } from "@goodsdks/citizen-sdk";
import { ethers } from "ethers";
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { createPublicClient, http } from 'viem';
import { useAccount, useSendTransaction } from "wagmi";


import { createWalletClient, custom, PublicClient, WalletClient } from 'viem';
import { celo } from 'viem/chains';

// Add TypeScript declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Constants
const RECIPIENT_WALLET = '0xb82896C4F251ed65186b416dbDb6f6192DFAF926';

// Divvi Integration 
const dataSuffix = getDataSuffix({
  consumer: '0xb82896C4F251ed65186b416dbDb6f6192DFAF926',
  providers: ['0x0423189886d7966f0dd7e7d256898daeee625dca'],
})

// Token definitions
const TOKENS = {
  'G$': {
    address: '0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A', // G$ token address on Celo
    decimals: 18
  }
};

// Helper functions for token handling
const getTokenAddress = (token: string, tokens: any): string => {
  return tokens[token]?.address || '';
};


type ClaimProcessorType = {
  isProcessing: boolean;
  setIsProcessing: (isProcessing: boolean) => void;
  sendTransactionAsync: any;
  entitlement: bigint | null;
  canClaim: boolean;
  handleClaim: () => Promise<void>;
  processDataTopUp: (values: any, selectedPrice: number, availablePlans: any[], networks: any[]) => Promise<{ success: boolean; error?: any }>;
  processPayment: () => Promise<any>;
  TOKENS: typeof TOKENS;

  isWaitingTx?: boolean;
  setIsWaitingTx?: (waiting: boolean) => void;

};

type ClaimProviderProps = {
  children: ReactNode;
};

// Create the context
const ClaimProcessorContext = createContext<ClaimProcessorType | undefined>(undefined);

// Provider component - this should be a component, not a hook
export function ClaimProvider({ children }: ClaimProviderProps) {

  const { address, isConnected } = useAccount();
  const [isProcessing, setIsProcessing] = useState(false);
  const [entitlement, setEntitlement] = useState<bigint | null>(null);
  const [canClaim, setCanClaim] = useState(false);
 const [isWaitingTx, setIsWaitingTx] = useState(false);
  const [recipient, setRecipient] = useState<string>('');
  const { sendTransactionAsync } = useSendTransaction({});
  const [claimSDK, setClaimSDK] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const initializationAttempted = useRef(false);


  const publicClient = createPublicClient({
    chain: celo,
    transport: http()
  })
  const walletClient = useMemo(() => {
    if (isConnected && window.ethereum && address) {
      return createWalletClient({
        account: address as `0x${string}`,
        chain: celo,
        transport: custom(window.ethereum)
      });
    }
    return null;
  }, [isConnected, address]);

  const identitySDK = useMemo(() => {
    if (isConnected && publicClient && walletClient) {
      try {
        return new IdentitySDK(
          publicClient as unknown as PublicClient,
          walletClient as unknown as WalletClient,
          "production"
        );
      } catch (error) {
        console.error("Failed to initialize IdentitySDK:", error);
        return null;
      }
    }
    return null;
  }, [publicClient, walletClient, isConnected]);

  useEffect(() => {
    const initializeClaimSDK = async () => {
      // Skip if we're already initializing, already initialized, or missing prerequisites
      if (
        isInitializing || 
        initializationAttempted.current || 
        claimSDK || 
        !isConnected || 
        !walletClient || 
        !identitySDK || 
        !address
      ) {
        return;
      }

      try {
        setIsInitializing(true);
        initializationAttempted.current = true;
        
        console.log("Initializing ClaimSDK with connected wallet...");
        
        const sdk = ClaimSDK.init({
          publicClient: publicClient as PublicClient,
          walletClient: walletClient as unknown as WalletClient,
          identitySDK,
          env: 'production',
        });

        console.log("ClaimSDK initialized successfully");
        
        const initializedSDK = await sdk;
        setClaimSDK(initializedSDK);

        // Check initial entitlement
        if (initializedSDK) {
          const entitlementValue = await initializedSDK.checkEntitlement();
          setEntitlement(entitlementValue);
          setCanClaim(entitlementValue > BigInt(0));
        }
      } catch (error) {
        console.error("Error initializing ClaimSDK:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeClaimSDK();
  }, [isConnected, walletClient, identitySDK, address, publicClient, claimSDK, isInitializing]);

  // Reset initialization state when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      initializationAttempted.current = false;
      setClaimSDK(null);
    }
  }, [isConnected]);



 
  const handleClaim = async () => {
    try {
      if (!isConnected) {
        throw new Error("Wallet not connected");
      }

      if (!claimSDK) {
        throw new Error("ClaimSDK not initialized");
      }

      toast.info("Processing claim for G$ tokens...");
      setIsProcessing(true);
      // Check entitlement again after claiming
      const newEntitlement = await claimSDK.checkEntitlement();
      setEntitlement(newEntitlement);
      const tx = await claimSDK.claim();
      if (!tx) {
        return;
      }
      toast.success("Successfully claimed G$ tokens!");

    } catch (error) {
      console.error("Error during claim:", error);
      toast.error("There was an error processing your claim.");
    } finally {
      setIsProcessing(false);
    }
  };

  const processDataTopUp = async (values: any, selectedPrice: number, availablePlans: any[], networks: any[]) => {
    if (!values || !values.phoneNumber || !values.country || !values.network) {
      toast.error("Please ensure all required fields are filled out.");
      return { success: false };
    }

    try {
      const cleanPhoneNumber = values.phoneNumber.replace(/[\s\-\+]/g, '');

      const response = await fetch('/api/topup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operatorId: values.network,
          amount: selectedPrice.toString(),
          recipientPhone: {
            country: values.country,
            phoneNumber: cleanPhoneNumber
          },
          email: values.email,
          isFreeClaim: true
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const selectedPlan = availablePlans[0];
        toast.success(`Successfully topped up ${values.phoneNumber} with ${selectedPlan?.name || 'your selected plan'}.`);
        return { success: true };
      } else {
        console.error("Top-up API Error:", data);
        toast.error(data.error || "There was an issue processing your top-up. Our team has been notified.");
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error("Error during top-up:", error);
      toast.error("There was an error processing your top-up. Our team has been notified and will resolve this shortly.");
      return { success: false, error };
    }
  };
  const processPayment = async () => {
    if (!entitlement || entitlement <= BigInt(0)) {
      toast.info("No entitlement available at the moment.");
      return;
    }

    const selectedToken = "G$";
    const tokenAddress = getTokenAddress(selectedToken, TOKENS);

    const tokenAbi = ["function transfer(address to, uint256 value) returns (bool)"];
    const transferInterface = new ethers.utils.Interface(tokenAbi);
    const transferData = transferInterface.encodeFunctionData("transfer", [
      RECIPIENT_WALLET,
      entitlement
    ]);

    const dataWithSuffix = transferData + dataSuffix;

    toast.info("Processing payment for data bundle...");
    try {
      const tx = await sendTransactionAsync({
        to: tokenAddress as `0x${string}`,
        data: dataWithSuffix as `0x${string}`,
      });

      try {
        await submitReferral({
          txHash: tx as unknown as `0x${string}`,
          chainId: 42220,
        });
      } catch (referralError) {
        console.error("Referral submission error:", referralError);
      }

      toast.success("Payment transaction completed. Processing data top-up...");
      return tx;
    } catch (error) {
      console.error("Payment transaction failed:", error);
      toast.error("Payment transaction failed. Please try again.");
  
    }
  };


  // Combine all context values
  const value = {
    isProcessing,
    setIsProcessing,
    sendTransactionAsync,
    entitlement,
    canClaim,
    handleClaim,
    processDataTopUp,
    processPayment,
    TOKENS,
    isWaitingTx: false,
    setIsWaitingTx,

  };

  return (
    <ClaimProcessorContext.Provider value={value}>
      {children}
      {/* Multi-step Transaction Dialog */}
    
    </ClaimProcessorContext.Provider>
  );
}

// Hook to use the claim processor context
export function useClaimProcessor(): ClaimProcessorType {
  const context = useContext(ClaimProcessorContext);
  if (!context) {
    throw new Error("useClaimProcessor must be used within a ClaimProvider");
  }
  return context;
}