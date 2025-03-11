import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { mockRepoInfo } from "../data/mockdata";

interface UserInfo {
  login: string;
  avatar_url: string;
}

interface UserContextType {
  userInfo: UserInfo | null;
  setUserInfo: (user: UserInfo) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    if (import.meta.env.MODE === "development") {
      console.warn("Vite dev env: Using Mock User Data");
      setUserInfo(mockRepoInfo.userInfo);
    } else {
      chrome.storage.local.get(["GitHub_User_Info"], (data) => {
        if (data.GitHub_User_Info) {
          setUserInfo(data.GitHub_User_Info);
        }
      });
    }
  }, []);

  return (
    <UserContext.Provider value={{ userInfo, setUserInfo }}>
      {children}
    </UserContext.Provider>
  );
};
