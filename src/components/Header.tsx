"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FaGithub } from "react-icons/fa";
import Image from "next/image";

export default function Header() {
    return (
        <header className="w-full px-8 py-4 flex items-center justify-between backdrop-blur-md bg-white/30 border-b border-white/20 shadow-lg sticky top-0 z-50">
            {/* GitHub 图标链接 */}
            <a
                href="https://github.com/zhouhangmyers" // TODO: 替换为你的仓库链接
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:text-gray-700 transition duration-300 ease-in-out transform hover:scale-110"
            >
                <FaGithub size={28} />
            </a>

            {/* 标题 */}
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-transparent bg-clip-text animate-gradient">
                AirDrop TSender
            </h1>

            {/* 钱包连接按钮 */}
            <div className="scale-95 hover:scale-100 transition-transform duration-300 ease-in-out">
                <ConnectButton />
            </div>


        </header>
    );
}

