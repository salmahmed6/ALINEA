import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  mainnet,
  polygon,
  base,
  arbitrum,
  sepolia,
  polygonMumbai,
  baseSepolia,
  arbitrumSepolia,
} from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'ALINEA - Emotional Trading Guard',
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || 'YOUR_WC_PROJECT_ID',
  chains: [
    mainnet,
    polygon,
    base,
    arbitrum,
    // Testnets for development
    ...(process.env.NODE_ENV === 'development'
      ? [sepolia, polygonMumbai, baseSepolia, arbitrumSepolia]
      : []),
  ],
  ssr: true,
});

export const supportedChains = {
  ethereum: mainnet.id,
  polygon: polygon.id,
  base: base.id,
  arbitrum: arbitrum.id,
};

export const chainNames: Record<number, string> = {
  [mainnet.id]: 'Ethereum',
  [polygon.id]: 'Polygon',
  [base.id]: 'Base',
  [arbitrum.id]: 'Arbitrum',
};

export const chainIcons: Record<number, string> = {
  [mainnet.id]: '🔷',
  [polygon.id]: '💜',
  [base.id]: '⚫',
  [arbitrum.id]: '🔵',
};
