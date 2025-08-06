import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

const TOKEN_KEY = 'auth_token';

export type TokenType = {
  access: string;
  refresh: string;
};

export const getToken = () => {
  const token = storage.getString(TOKEN_KEY);
  return token ? (JSON.parse(token) as TokenType) : null;
};

export const setToken = (token: TokenType) => {
  storage.set(TOKEN_KEY, JSON.stringify(token));
};

export const removeToken = () => {
  storage.delete(TOKEN_KEY);
};
