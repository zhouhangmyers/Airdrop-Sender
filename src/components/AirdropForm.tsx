"use client"

import { useMemo, useState, useEffect } from "react";
import { InputForm } from "@/components/ui/InputField";
import { chainsToTSender, tsenderAbi, erc20Abi } from "@/constants";
import { useChainId, useConfig, useAccount, useWriteContract } from "wagmi";
import { readContract, waitForTransactionReceipt } from "@wagmi/core";
import { calculateTotal } from "@/utils";
import { etherUnits, formatEther, formatUnits } from "viem";

export default function AirdropForm() {
    const [tokenAddress, setTokenAddress] = useState("")
    const [recipients, setRecipients] = useState("")
    const [amounts, setAmounts] = useState("")
    const chainId = useChainId()
    const config = useConfig()
    const account = useAccount()
    const total: number = useMemo(() => calculateTotal(amounts), [amounts])
    const { writeContractAsync } = useWriteContract()
    const [status, setStatus] = useState<'idle' | 'confirming' | 'processing' | 'error'>('idle')
    const [tokenName, setTokenName] = useState<string>("");
    const [tokenDecimals, setTokenDecimals] = useState<number>(0);

    // 在组件开头 useState 后添加
    useEffect(() => {
        const savedTokenAddress = localStorage.getItem('tokenAddress');
        const savedRecipients = localStorage.getItem('recipients');
        const savedAmounts = localStorage.getItem('amounts');

        if (savedTokenAddress) setTokenAddress(savedTokenAddress);
        if (savedRecipients) setRecipients(savedRecipients);
        if (savedAmounts) setAmounts(savedAmounts);
    }, []);

    useEffect(() => {
        localStorage.setItem('tokenAddress', tokenAddress);
    }, [tokenAddress]);

    useEffect(() => {
        localStorage.setItem('recipients', recipients);
    }, [recipients]);

    useEffect(() => {
        localStorage.setItem('amounts', amounts);
    }, [amounts]);

    useEffect(() => {
        const fetchTokenMetadata = async () => {
            if (!tokenAddress) {
                setTokenName("");
                setTokenDecimals(0);
                return;
            }

            try {
                const [name, decimals] = await Promise.all([
                    readContract(config, {
                        abi: erc20Abi,
                        address: tokenAddress as `0x${string}`,
                        functionName: "name",
                    }),
                    readContract(config, {
                        abi: erc20Abi,
                        address: tokenAddress as `0x${string}`,
                        functionName: "decimals",
                    }),
                ]);

                setTokenName(name as string);
                setTokenDecimals(Number(decimals));
            } catch (error) {
                console.error("Failed to fetch token metadata:", error);
                setTokenName("Invalid Token");
                setTokenDecimals(0);
            }
        };

        fetchTokenMetadata();
    }, [tokenAddress, config]);

    const amountInTokens = useMemo(() => {
        if (!tokenDecimals) return 0;
        return formatEther(BigInt(total));
    }, [amounts, tokenDecimals]);

    async function getApprovedAmount(tSenderAddress: string | null): Promise<number> {
        if (!tSenderAddress) {
            alert("No address found, please use a supported chain")
            return 0
        }

        const response = await readContract(config, {
            abi: erc20Abi,
            address: tokenAddress as `0x${string}`,
            functionName: "allowance",
            args: [account.address!, tSenderAddress as `0x${string}`]
        })

        return Number(response)
    }

    async function handleSubmit() {
        if (status !== 'idle') return

        try {
            const tSenderAddress = chainsToTSender[chainId]?.tsender
            if (!tSenderAddress) {
                alert("Unsupported chain")
                return
            }

            const approvedAmount = await getApprovedAmount(tSenderAddress)
            const needsApproval = approvedAmount < total

            if (needsApproval) {
                // Handle approval
                setStatus('confirming')
                const approvalHash = await writeContractAsync({
                    abi: erc20Abi,
                    address: tokenAddress as `0x${string}`,
                    functionName: "approve",
                    args: [tSenderAddress as `0x${string}`, BigInt(total)],
                })

                setStatus('processing')
                await waitForTransactionReceipt(config, { hash: approvalHash })
            }

            // Handle airdrop
            setStatus('confirming')
            const airdropHash = await writeContractAsync({
                abi: tsenderAbi,
                address: tSenderAddress as `0x${string}`,
                functionName: "airdropERC20",
                args: [
                    tokenAddress as `0x${string}`,
                    recipients.split(/[,\n]+/).map(addr => addr.trim()).filter(Boolean),
                    amounts.split(/[,\n]+/).map(amt => amt.trim()).filter(Boolean),
                    BigInt(total),
                ],
            })

            setStatus('processing')
            await waitForTransactionReceipt(config, { hash: airdropHash })
            setStatus('idle')
        } catch (error) {
            console.error("Transaction failed:", error)
            setStatus('error')
            setTimeout(() => setStatus('idle'), 3000)
        }
    }

    const buttonContent = () => {
        switch (status) {
            case 'confirming':
                return (
                    <>
                        <span className="spinner" /> Confirming in wallet
                    </>
                )
            case 'processing':
                return (
                    <>
                        <span className="spinner" /> Transaction processing...
                    </>
                )
            case 'error':
                return "Error! Please try again"
            default:
                return <><span className="relative z-10">🔥 Drop It</span></>
        }
    }

    return (
        <div className="bg-[#1a1a1a] p-8 rounded-lg border border-[#444] shadow-inner max-w-4xl mx-auto space-y-6">
            <InputForm
                label="Token Address"
                placeholder="0x"
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                className="p-4 bg-[#2a2a2a] border border-[#555] rounded-md text-[#ddd] font-mono focus:outline-none focus:ring-2 focus:ring-orange-400"

            />
            <InputForm
                label="Recipients"
                placeholder="0x1234,0x4567"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                large
                className="p-4 bg-[#2a2a2a] border border-[#555] rounded-md text-[#ddd] font-mono focus:outline-none focus:ring-2 focus:ring-orange-400"

            />
            <InputForm
                label="Amounts"
                placeholder="100,200"
                value={amounts}
                onChange={(e) => setAmounts(e.target.value)}
                large
                className="p-4 bg-[#2a2a2a] border border-[#555] rounded-md text-[#ddd] font-mono focus:outline-none focus:ring-2 focus:ring-orange-400"

            />

            <div className="p-4 bg-[#2a2a2a] border border-[#555] rounded-md shadow-inner">
                <h3 className="text-[#ccc] font-bold text-md mb-3 font-mono">Transaction Details</h3>
                <div className="space-y-2 text-[#bbb] text-sm font-mono">
                    <div className="flex justify-between">
                        <span className="text-orange-400">Token Name:</span>
                        <span>{tokenName || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-orange-400">Amount (wei):</span>
                        <span>{tokenAddress ? total : "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-orange-400">Amount (tokens):</span>
                        <span>{tokenAddress ? amountInTokens : "N/A"}</span>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={status !== 'idle'}
                    className="px-6 py-3 bg-[#333] text-orange-300 border border-[#666] rounded-md font-bold uppercase tracking-wide hover:bg-[#444] active:translate-y-[1px] shadow-inner transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {buttonContent()}
                </button>
            </div>

            <style jsx>{`
                .spinner {
                    display: inline-block;
                    width: 1.2em;
                    height: 1.2em;
                    border: 2px solid #ffa500;
                    border-radius: 50%;
                    border-top-color: transparent;
                    animation: spin 1s linear infinite;
                    margin-right: 0.5em;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    )
}
