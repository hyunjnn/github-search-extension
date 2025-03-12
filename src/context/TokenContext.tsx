import { createContext, useContext, useState, ReactNode } from "react";

interface TokenContextType {
  token: string;
  setToken: (token: string) => void;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

// 커스텀 훅 생성
export const useToken = () => {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error("useToken must be used within a TokenProvider");
  }
  return context;
};

// Provider 생성
export const TokenProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState("");

  return (
    <TokenContext.Provider value={{ token, setToken }}>
      {children}
    </TokenContext.Provider>
  );
};
