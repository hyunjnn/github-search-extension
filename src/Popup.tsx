import { useEffect, useState } from "react";
import "./style.css";
import LoginScreen from "./components/LoginScreen";
import SearchScreen from "./components/SearchScreen";

const Popup = () => {
  const [token, setToken] = useState("");

  useEffect(() => {
    chrome.storage.local.get(["GitHub_Access_Token"], (data) => {
      if (data.GitHub_Access_Token) {
        setToken(data.GitHub_Access_Token);
      }
    });
  }, []);

  return (
    <div className="popup-container">
      <h1 className="app-title">Commit Finder</h1>
      <h2 className="subtitle">GitHub Commit & Comment Search</h2>

      {!token ? (
        <LoginScreen setToken={setToken} />
      ) : (
        <SearchScreen token={token} />
      )}
    </div>
  );
};

export default Popup;
