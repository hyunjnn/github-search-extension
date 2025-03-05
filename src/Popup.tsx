import { useEffect, useRef, useState } from "react";
import "./style.css";
import SearchResults from "./components/SearchResults";

// 검색 결과 데이터 타입
interface SearchResult {
  type: "commit" | "comment";
  author: string;
  message: string;
  url: string;
}

const getRepoInfoFromUrl = () => {
  return new Promise<{repoOwner: string; repoName: string}>((resolve) => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      const url = tabs[0]?.url || "";
      const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (match) {
          resolve({repoOwner: match[1], repoName: match[2]});
        } else{
          resolve({repoOwner: "", repoName: ""});
        }
    });
  });
};

const Popup = () => {
  const [token, setToken] = useState("");
  const [repoOwner, setRepoOwner] = useState("");
  const [repoName, setRepoName] = useState("");
  const [currentRepoOwner, setCurrentRepoOwner] = useState("");
  const [currentRepoName, setCurrentRepoName] = useState("");
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const repoOwnerRef = useRef<HTMLInputElement>(null);
  const repoNameRef = useRef<HTMLInputElement>(null);
  const keywordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chrome.storage.local.get(["GitHub_Access_Token"], (data) => {
      if (data.GitHub_Access_Token) {
        setToken(data.GitHub_Access_Token);
      }
    });
  }, []);  

  useEffect(() => {
    chrome.storage.local.get(["GitHub_Access_Token", "repoOwner", "repoName", "keyword", "results"], 
      (data) => {
        if (data.GitHub_Access_Token) setToken(data.GitHub_Access_Token);
        if (data.repoOwner) setRepoOwner(data.repoOwner);
        if (data.repoName) setRepoName(data.repoName);
        if (data.keyword) setKeyword(data.keyword);
        if (data.results) setResults(data.results);
      }
    );

    getRepoInfoFromUrl().then(({repoOwner, repoName}) => {
      setCurrentRepoOwner(repoOwner);
      setCurrentRepoName(repoName);
    });

    if (keywordRef.current) {
      keywordRef.current.focus();
    }
  }, []);

  useEffect(() => {
    chrome.storage.local.set({ repoOwner, repoName, keyword, results });
  }, [repoOwner, repoName, keyword, results]);

  const handleUseCurrentRepo = () => {
    setRepoOwner(currentRepoOwner);
    setRepoName(currentRepoName);
    setKeyword("");
    setResults([]);
  };

  const handleLogin = () => {
    chrome.runtime.sendMessage({action: "beginOAuth2"});
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, refIndex: number) => {
    if (event.key === "Enter") {
      handleSearch();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      switch (refIndex) {
        case 0: repoNameRef.current?.focus(); break;
        case 1: keywordRef.current?.focus(); break;
      }
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      switch (refIndex) {
        case 1: repoOwnerRef.current?.focus(); break;
        case 2: repoNameRef.current?.focus(); break;
      }
    }
  }

  const handleSearch = () => {
    if (!repoOwner || !repoName || !keyword) {
      alert("Please fill out all fields!");
      return;
    }

    setLoading(true);
    setResults([]); // 기존 결과 초기화

    chrome.storage.local.get("GitHub_Access_Token", (data) => {
      const storedToken = data.GitHub_Access_Token;
      if (!storedToken) {
        alert("You need to log in first!");
        setLoading(false);
        return;
      }

      chrome.runtime.sendMessage(
        {
          action: "searchCommits",
          token: storedToken,
          repoOwner,
          repoName,
          keyword,
        },
        (response) => {
          setLoading(false);

          if (response.error) {
            alert("Error: " + response.error);
            return;
          }

          setResults(response.results);
        }
      );
    });
  };


  return (
    <div className="popup-container">
      <h2>GitHub Commit & Comment Search</h2>

      {!token ? (
        <button onClick={handleLogin}>GitHub 로그인</button>
      ) : (
        <>
          {currentRepoOwner && currentRepoName && (repoOwner !== currentRepoOwner || repoName !== currentRepoName) && (
            <div className="repo-alert">
              <span className="repo-name">{currentRepoOwner}/{currentRepoName}</span>
              <button className="switch-repo-btn" title="Switch Repository" onClick={handleUseCurrentRepo}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12 4V1L8 5l4 4V6a6 6 0 0 1 6 6h2a8 8 0 0 0-8-8zm0 16v3l4-4-4-4v3a6 6 0 0 1-6-6H4a8 8 0 0 0 8 8z"/>
                </svg>
              </button>
            </div>
          )}

          <input ref={repoOwnerRef} type="text" placeholder="Repository owner" value={repoOwner} onChange={(e) => setRepoOwner(e.target.value)} onKeyDown={(e) => handleKeyDown(e, 0)}/>
          <input ref={repoNameRef} type="text" placeholder="Repository name" value={repoName} onChange={(e) => setRepoName(e.target.value)} onKeyDown={(e) => handleKeyDown(e, 1)}/>
          <input ref={keywordRef} type="text" placeholder="Keyword" value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={(e) => handleKeyDown(e, 2)}/>
          <button onClick={handleSearch} disabled={loading}>{loading ? "Loading..." : "Search"}</button>
          
          <SearchResults results={results} />
        </>
      )}

      
    </div>
  );
};

export default Popup;