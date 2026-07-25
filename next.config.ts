import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  transpilePackages: ["@langchain/ollama", "@langchain/langgraph", "@langchain/core", "@langchain/community"],
};

export default nextConfig;
