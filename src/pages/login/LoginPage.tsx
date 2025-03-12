import { useToken } from "../../context/TokenContext";
import styles from "./LoginPage.module.css";

const LoginPage = () => {
  const { setToken } = useToken();

  const handleLogin = () => {
    chrome.runtime.sendMessage({ action: "beginOAuth2" }, (response) => {
      if (response?.token) {
        setToken(response.token);
        chrome.storage.local.set({ GitHub_Access_Token: response.token });
      }
    });
  };

  return (
    <div className="login-page">
      {/* <h1 className="app-title">Commit Finder</h1>
      <h2 className="subtitle">GitHub Commit & Comment Search</h2> */}
      <button className={styles.githubLoginBtn} onClick={handleLogin}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="black"
        >
          <path d="M12 .5C5.61.5.5 5.61.5 12c0 5.09 3.29 9.4 7.86 10.93.57.1.77-.25.77-.55v-2.08c-3.2.7-3.88-1.37-3.88-1.37-.52-1.3-1.27-1.65-1.27-1.65-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.77 2.69 1.26 3.34.97.1-.75.4-1.26.73-1.55-2.56-.3-5.26-1.28-5.26-5.68 0-1.25.44-2.26 1.16-3.06-.12-.3-.5-1.5.1-3.12 0 0 .96-.31 3.14 1.17a10.86 10.86 0 0 1 5.72 0c2.18-1.48 3.14-1.17 3.14-1.17.6 1.62.22 2.82.1 3.12.72.8 1.16 1.81 1.16 3.06 0 4.41-2.7 5.37-5.28 5.66.42.36.8 1.1.8 2.23v3.3c0 .3.2.65.78.54C20.22 21.4 23.5 17.09 23.5 12 23.5 5.61 18.39.5 12 .5Z" />
        </svg>
        Sign in with GitHub
      </button>
    </div>
  );
};

export default LoginPage;
