"use client"

import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { mainnet, arbitrum, optimism, base, sepolia, anvil, zksync } from "wagmi/chains"

export default getDefaultConfig({
    appName: "TSender",
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!, //通过WalletConnect Cloud获取项目ID 选择APPkit，是APP连接钱包，不是你设计钱包连接APP（walletKit)
    chains: [mainnet, arbitrum, optimism, base, sepolia, anvil, zksync],
    ssr: false //服务器端关闭渲染
})
