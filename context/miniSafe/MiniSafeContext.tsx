import { abi, contractAddress } from '@/utils/abi';
import { getDataSuffix, submitReferral } from '@divvi/referral-sdk';
import { readContract, writeContract } from '@wagmi/core';
import { ethers } from "ethers";
import React, { createContext, useCallback, useContext, useState } from 'react';
import { parseUnits } from "viem";
import {
  useAccount,
  usePublicClient,
  useSendTransaction,
} from 'wagmi';


import { config } from '@/providers/wagmi-provider';

// Divvi Integration
const dataSuffix = getDataSuffix({
  consumer: '0xb82896C4F251ed65186b416dbDb6f6192DFAF926',
  providers: ['0x0423189886d7966f0dd7e7d256898daeee625dca'],
})

interface MiniSafeContextType {
  // Token addresses
  usdcAddress: string;
  cusdAddress: string;
  usdtAddress: string;

  // State values
  depositAmount: number;
  setDepositAmount: (amount: number) => void;
  withdrawAmount: number;
  setWithdrawAmount: (amount: number) => void;
  cusdBalance: string;
  usdcBalance: string;
  usdtBalance: string;
  tokenBalance: string;
  selectedToken: string;
  setSelectedToken: (token: string) => void;
  isApproved: boolean;
  setIsApproved: (approved: boolean) => void;
  isApproving: boolean;
  isWaitingTx: boolean;
  isLoading: boolean;
  interestRate: number;

 
  // Functions
  getBalance: () => Promise<void>;
  getTokenBalance: () => Promise<void>;
  handleTokenChange: (value: string) => void;
  approveSpend: () => Promise<void>;
  handleDeposit: () => Promise<void>;
  handleWithdraw: () => Promise<void>;
  handleBreakLock: () => Promise<void>;
  formatBalance: (balance: string, decimals?: number) => string;
}

const MiniSafeContext = createContext<MiniSafeContextType | undefined>(undefined);

export const MiniSafeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Token addresses
  const usdcAddress = "0xcebA9300f2b948710d2653dD7B07f33A8B32118C";
  const cusdAddress = "0x765de816845861e75a25fca122bb6898b8b1282a";
  const usdtAddress = "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e";

  // State values
  const [depositAmount, setDepositAmount] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [cusdBalance, setcusdBalance] = useState('0');
  const [usdcBalance, setUsdcBalance] = useState('0');
  const [usdtBalance, setusdtBalance] = useState('0');
  const [tokenBalance, setTokenBalance] = useState('0');
  const [selectedToken, setSelectedToken] = useState('CUSD');
  const [isApproved, setIsApproved] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isWaitingTx, setIsWaitingTx] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [interestRate] = useState(5); // 5% APY for visualization

  const {
    sendTransactionAsync
  } = useSendTransaction();


  // Get wagmi account info
  const { address } = useAccount();
  const publicClient = usePublicClient();

  const getBalance = useCallback(async () => {
    if (!address) return;

    try {
      setIsLoading(true);

      // Read CUSD balance
      const cusdData = await readContract(config, {
        address: contractAddress as `0x${string}`,
        abi,
        functionName: 'getBalance',
        args: [address, cusdAddress],
      });

      // Set balance, ensuring we never have empty string
      setcusdBalance(cusdData ? cusdData.toString() : '0');

      // Read USDC balance
      const usdcData = await readContract(config, {
        address: contractAddress as `0x${string}`,
        abi,
        functionName: 'getBalance',
        args: [address, usdcAddress],
      });

      // Set balance, ensuring we never have empty string
      setUsdcBalance(usdcData ? usdcData.toString() : '0');

      // Read USDT balance
      const usdtData = await readContract(config, {
        address: contractAddress as `0x${string}`,
        abi,
        functionName: 'getBalance',
        args: [address, usdtAddress],
      });

      // Set balance, ensuring we never have empty string
      setusdtBalance(usdtData ? usdtData.toString() : '0');
    } catch (error) {
      console.error("Error fetching balances:", error);
    } finally {
      setIsLoading(false);
    }
  }, [address, cusdAddress, usdcAddress, usdtAddress]);

  const getTokenBalance = useCallback(async () => {
    if (!address) return;

    try {
      const data = await readContract(config, {
        address: contractAddress as `0x${string}`,
        abi,
        functionName: 'balanceOf',
        args: [address],
      });

      if (data) {
        const formattedBalance = ethers.utils.formatUnits(data as unknown as bigint, 0);
        setTokenBalance(formattedBalance.toString());
      } else {
        // Ensure we never set an empty string
        setTokenBalance('0');
      }
    } catch (error) {
      console.error("Error fetching token balance:", error);
      // Set a default value on error
      setTokenBalance('0');
    }
  }, [address]);

  const handleTokenChange = (value: string) => {
    setSelectedToken(value);
  };
 
  const getTokenAddress = (token: string) => {
    switch (token) {
      case 'USDC':
        return usdcAddress;
      case 'CUSD':
        return cusdAddress;
      case 'USDT':
        return usdtAddress;
      default:
        return usdcAddress;
    }
  };

  // Get token decimals helper
  const getTokenDecimals = (token: string) => {
    switch (token) {
      case 'USDC': return 6;  // USDC typically uses 6 decimals
      case 'USDT': return 6;  // USDT typically uses 6 decimals  
      case 'CUSD': return 18; // Assuming CUSD uses 18 decimals
      default: return 18;
    }
  };

  // Configure approve transaction
  const approveSpend = async () => {
    if (!depositAmount || isNaN(Number(depositAmount)) || Number(depositAmount) <= 0) {
      return;
    }

    if (!address) {
      return;
    }
    
    setIsApproving(true);
    
    try {
      await getBalance();

      const tokenAddress = getTokenAddress(selectedToken);
      const decimals = getTokenDecimals(selectedToken);
      const depositValue = parseUnits(depositAmount.toString(), decimals);

      // Check allowance first
      const allowanceData = await readContract(config, {
        address: tokenAddress as `0x${string}`,
        abi: [
          {
            name: 'allowance',
            type: 'function',
            stateMutability: 'view',
            inputs: [
              { name: 'owner', type: 'address' },
              { name: 'spender', type: 'address' }
            ],
            outputs: [{ name: '', type: 'uint256' }]
          }
        ],
        functionName: 'allowance',
        args: [address, contractAddress],
      });
      
      
      // Compare BigInt values directly
      if ((allowanceData as bigint) >= (depositValue as bigint)) {
        setIsApproved(true);
        setIsApproving(false);

        return;
      }
      

      const tokenAbi = [
        "function allowance(address owner, address spender) view returns (uint256)",
        "function approve(address spender, uint256 amount) returns (bool)"
      ];
      
      // Correctly encode the approve function with parameters
      const approveInterface = new ethers.utils.Interface(tokenAbi);
      const approveData = approveInterface.encodeFunctionData("approve", [
        contractAddress,
        depositValue,
      ]);

      // Append the data suffix to the approve call data
      const dataWithSuffix = approveData + dataSuffix;

      // Send the transaction with the properly encoded data
      const tx = await sendTransactionAsync({
        to: tokenAddress as `0x${string}`,
        data: dataWithSuffix as `0x${string}`,
        chainId: 42220,
      });
      

      
      try {
        await submitReferral({
          txHash: tx,
          chainId: 42220
        });

        setIsApproved(true);

      } catch (referralError) {
        console.error("Error submitting referral:", referralError);
        setIsApproved(true);

      }
    } catch (error) {
      console.error("Error approving spend:", error);
      
    } finally {
      setIsApproving(false);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || !selectedToken) {
      return;
    }

    if (!address) {
      return;
    }

    // Open the multi-step dialog
    setIsWaitingTx(true);

    try {
      // Update first step to loading state
      
      const tokenAddress = getTokenAddress(selectedToken);
      const decimals = getTokenDecimals(selectedToken);
      const depositValue = parseUnits(depositAmount.toString(), decimals);

      // Check balance and update first step
      await getBalance();
      await getTokenBalance();

      // Start second step - allowance

      // Check if already approved
      const allowanceData = await readContract(config, {
        address: tokenAddress as `0x${string}`,
        abi: [
          {
            name: 'allowance',
            type: 'function',
            stateMutability: 'view',
            inputs: [
              { name: 'owner', type: 'address' },
              { name: 'spender', type: 'address' }
            ],
            outputs: [{ name: '', type: 'uint256' }]
          }
        ],
        functionName: 'allowance',
        args: [address, contractAddress],
      });


      // If not approved, approve
      if ((allowanceData as bigint) < (depositValue as bigint)) {
        // Start approval step
        const tokenAbi = [
          "function approve(address spender, uint256 amount) returns (bool)"
        ];
        const approveInterface = new ethers.utils.Interface(tokenAbi);
        const approveData = approveInterface.encodeFunctionData("approve", [
          contractAddress,
          depositValue,
        ]);

        const dataWithSuffix = approveData + dataSuffix;
        await sendTransactionAsync({
          to: tokenAddress as `0x${string}`,
          data: dataWithSuffix as `0x${string}`,
          chainId: 42220,
        });
      } else {
      }
      
      // Start third step - deposit

      const hash = await writeContract(config, {
        address: contractAddress as `0x${string}`,
        abi,
        functionName: 'deposit',
        args: [tokenAddress, depositValue],
      });

    
      
      if (!publicClient) {
        throw new Error('Public client not available');
      }
      
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === 'success') {
        await getBalance();
        await getTokenBalance();
        setDepositAmount(0);
        setIsApproved(false);

      } else {
      }
    } catch (error) {
      console.error("Error making deposit:", error);
    } finally {
      setIsWaitingTx(false);
    }
  };

  const handleWithdraw = async () => {
    if (!selectedToken) {
      return;
    }
    if (!address) {
      return;
    }

    setIsWaitingTx(true);
    
    try {
      // Update first step to loading state
      
      const tokenAddress = getTokenAddress(selectedToken);
      const decimals = getTokenDecimals(selectedToken);

      let withdrawalAmount: string = "0";
      if (selectedToken === 'CUSD') {
        withdrawalAmount = cusdBalance;
      } else if (selectedToken === 'USDC') {
        withdrawalAmount = usdcBalance;
      } else if (selectedToken === 'USDT') {
        withdrawalAmount = usdtBalance;
      }

      // Check balance and update first step
      await getBalance();
      await getTokenBalance();
      
      // Start second step - withdrawal
      
      // Convert balance to proper units for withdrawal
      const weiAmount = BigInt(withdrawalAmount);

      const hash = await writeContract(config, {
        address: contractAddress as `0x${string}`,
        abi,
        functionName: 'withdraw',
        args: [tokenAddress, weiAmount],
      });

      
      if (!publicClient) {
        throw new Error('Public client not available');
      }
      
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      
      if (receipt.status === 'success') {

        await getBalance();
        await getTokenBalance();
        setWithdrawAmount(0);
      } else {
      }
    } catch (error) {
      console.error("Error making withdrawal:", error);
      
    } finally {
      setIsWaitingTx(false);
    }
  };

  const handleBreakLock = async () => {
    if (!address) {
      return;
    }

    // Open the multi-step dialog
    setIsWaitingTx(true);

    try {
      // Update first step to loading state
      const tokenAddress = getTokenAddress(selectedToken);

      // Get token balance
      await getBalance();
      await getTokenBalance();
      
      // Update first step to success and start second step

      // approve token spend if not already approved
      const tokenAbi = [
        "function allowance(address owner, address spender) view returns (uint256)",
        "function approve(address spender, uint256 amount) returns (bool)"
      ];
      
      const spend = await readContract(config, {
        address: contractAddress as `0x${string}`,
        abi,
        functionName: 'MIN_TOKENS_FOR_TIMELOCK_BREAK',
      }) as bigint;
      
      const spendAmount = spend;
      
      // Correctly encode the approve function with parameters
      const approveInterface = new ethers.utils.Interface(tokenAbi);
      const approveData = approveInterface.encodeFunctionData("approve", [
        contractAddress,
        spendAmount,
      ]);

      // Append the data suffix to the approve call data
      const dataWithSuffix = approveData + dataSuffix;

      // Send the transaction with the properly encoded data
      await sendTransactionAsync({
        to: contractAddress as `0x${string}`,
        data: dataWithSuffix as `0x${string}`,
        chainId: 42220,
      });

      
      const breakTimelockInterface = new ethers.utils.Interface(abi);
      const breakTimelockData = breakTimelockInterface.encodeFunctionData("breakTimelock", [
        tokenAddress
      ]);
      const breakData = breakTimelockData + dataSuffix;
      
      let txHash: `0x${string}`;
      try {
        const sendHash = await sendTransactionAsync({
          to: contractAddress as `0x${string}`,
          data: breakData as `0x${string}`,
          chainId: 42220,
        });
        txHash = sendHash;
      } catch (error) {
        throw error;
      }


      if (!publicClient) {
        throw new Error('Public client not available');
      }

      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      
      if (receipt.status === 'success') {

        await getBalance();
        await getTokenBalance();
      } else {
      }
    } catch (error) {
   
      // Find the current loading step and mark it as error
     
    } finally {
      setIsWaitingTx(false);
    }
  };


  // Format balance for display
  const formatBalance = (balance: string | undefined, decimals = 2) => {
    if (!balance) return "0.00";

    const balanceNumber = parseFloat(balance);
    if (isNaN(balanceNumber)) {
      return "0.00";
    }
    return balanceNumber.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const value = {
    // Token addresses
    usdcAddress,
    cusdAddress,
    usdtAddress,

    // State values
    depositAmount,
    setDepositAmount,
    withdrawAmount,
    setWithdrawAmount,
    cusdBalance,
    usdcBalance,
    usdtBalance,
    tokenBalance,
    selectedToken,
    setSelectedToken,
    isApproved,
    setIsApproved,
    isApproving,
    isWaitingTx,
    isLoading,
    interestRate,


    // Functions
    getBalance,
    getTokenBalance,
    handleTokenChange,
    approveSpend,
    handleDeposit,
    handleWithdraw,
    handleBreakLock,
    formatBalance,
  };



  return (
    <MiniSafeContext.Provider value={value}>
      {children}

    </MiniSafeContext.Provider>
  );
};
export const useMiniSafe = () => {
  const context = useContext(MiniSafeContext);
  if (!context) {
    throw new Error('useMiniSafe must be used within a MiniSafeProvider');
  }
  return context;
}
export default MiniSafeProvider;