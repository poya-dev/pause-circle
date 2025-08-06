import { type User } from '@supabase/supabase-js';
import { create } from 'zustand';

import { createSelectors } from '../utils';
import type { TokenType } from './utils';
import { getToken, removeToken, setToken } from './utils';

interface AuthState {
  token: TokenType | null;
  user: User | null;
  status: 'idle' | 'signOut' | 'signIn';
  signIn: (data: TokenType, userData: User) => void;
  signOut: () => void;
  hydrate: () => void;
}

const _useAuth = create<AuthState>((set, get) => ({
  status: 'idle',
  token: null,
  user: null,
  signIn: (token, userData) => {
    setToken(token);
    set({ status: 'signIn', token, user: userData });
  },
  signOut: () => {
    removeToken();
    set({ status: 'signOut', token: null, user: null });
  },
  hydrate: () => {
    try {
      const userToken = getToken();
      if (userToken !== null) {
        // Note: In a real app, you'd want to fetch the user data here
        get().signIn(userToken, { id: userToken.access } as User);
      } else {
        get().signOut();
      }
    } catch (e) {
      console.error(e);
    }
  },
}));

export const useAuth = createSelectors(_useAuth);

export const signOut = () => _useAuth.getState().signOut();
export const signIn = (token: TokenType, userData: User) =>
  _useAuth.getState().signIn(token, userData);
export const hydrateAuth = () => _useAuth.getState().hydrate();
