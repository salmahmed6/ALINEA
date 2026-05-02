'use client';

import { create } from 'zustand';
import { UserProfile } from '@/lib/types';

interface WalletState {
  address: string | null;
  isConnected: boolean;
  userProfile: UserProfile | null;
  setAddress: (address: string | null) => void;
  setConnected: (connected: boolean) => void;
  setUserProfile: (profile: UserProfile | null) => void;
}

export const useWallet = create<WalletState>((set) => ({
  address: null,
  isConnected: false,
  userProfile: null,
  setAddress: (address) => set({ address }),
  setConnected: (connected) => set({ isConnected: connected }),
  setUserProfile: (profile) => set({ userProfile: profile }),
}));

export function useWalletConnect() {
  const setAddress = useWallet((state) => state.setAddress);
  const setConnected = useWallet((state) => state.setConnected);

  const connect = async () => {
    // Mock wallet connection for MVP
    const mockAddress = '0x' + Array(40).fill(0).map(() => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    
    setAddress(mockAddress);
    setConnected(true);
    
    console.log('[v0] Wallet connected:', mockAddress);
    return mockAddress;
  };

  const disconnect = () => {
    setAddress(null);
    setConnected(false);
  };

  return { connect, disconnect };
}
