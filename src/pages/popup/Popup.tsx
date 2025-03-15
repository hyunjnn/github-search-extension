import styles from "./Popup.module.css";
import LoginScreen from "../login/LoginPage";
import SearchScreen from "../search/SearchPage";
import { TokenProvider, useToken } from "../../context/TokenContext";
import { UserProvider } from "../../context/UserContext";
import { mockToken } from "../../data/mockdata";
import { useEffect } from "react";

const PopupContent = () => {
  const { token, setToken } = useToken();

  useEffect(() => {
    if (import.meta.env.MODE === "development") {
      console.warn("Vite Dev Env: Using Mock Token");
      setToken(mockToken);
    } else {
      chrome.storage.local.get(["GitHub_Access_Token"], (data) => {
        if (data.GitHub_Access_Token) {
          setToken(data.GitHub_Access_Token);
        }
      });
    }
  }, []);

  return (
    <div className={styles.popupContainer}>
      <h1 className={styles.appTitle}>Commit Finder</h1>
      <h2 className={styles.subTitle}>GitHub Commit & Comment Search</h2>

      {!token ? <LoginScreen /> : <SearchScreen />}
    </div>
  );
};

const Popup = () => {
  return (
    <TokenProvider>
      <UserProvider>
        <PopupContent />
      </UserProvider>
    </TokenProvider>
  );
};

export default Popup;
