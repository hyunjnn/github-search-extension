import { useEffect, useRef, useState } from "react";
import "./style.css";
import SearchResults from "./components/SearchResults";

// GitHub API 응답 타입 정의
// interface CommitData {
//   sha: string;
//   html_url: string;
//   commit: {
//     author: {
//       name: string;
//     };
//     message: string;
//   };
// }

// interface CommentData {
//   body: string;
//   user: {
//     login: string;
//   };
//   html_url: string;
// }

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

  const tokenRef = useRef<HTMLInputElement>(null);
  const repoOwnerRef = useRef<HTMLInputElement>(null);
  const repoNameRef = useRef<HTMLInputElement>(null);
  const keywordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chrome.storage.local.get(["repoOwner", "repoName", "keyword", "results"], (data) => {
      if (data.repoOwner) setRepoOwner(data.repoOwner);
      if (data.repoName) setRepoName(data.repoName);
      if (data.keyword) setKeyword(data.keyword);
      if (data.results) setResults(data.results);
    });

    getRepoInfoFromUrl().then(({repoOwner, repoName}) => {
      setCurrentRepoOwner(repoOwner);
      setCurrentRepoName(repoName);
    });

    if (tokenRef.current) {
      tokenRef.current.focus();
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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, refIndex: number) => {
    if (event.key === "Enter") {
      handleSearch();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      switch (refIndex) {
        case 0: repoOwnerRef.current?.focus(); break;
        case 1: repoNameRef.current?.focus(); break;
        case 2: keywordRef.current?.focus(); break;
      }
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      switch (refIndex) {
        case 1: tokenRef.current?.focus(); break;
        case 2: repoOwnerRef.current?.focus(); break;
        case 3: repoNameRef.current?.focus(); break;
      }
    }
  }

  const handleSearch = () => {
    if (!token || !repoOwner || !repoName || !keyword) {
      alert("Please fill out all fields!");
      return;
    }

    setLoading(true);
    setResults([]); // 기존 결과 초기화

    chrome.runtime.sendMessage(
      {
        action: "searchCommits",
        token,
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
  };

  return (
    <div className="popup-container">
      <h2>GitHub Commit & Comment Search</h2>

      {currentRepoOwner && currentRepoName && (repoOwner !== currentRepoOwner || repoName !== currentRepoName) && (
        <div className="repo-alert">
          <p className="repo-alert-text">
            Current repo: <strong>{currentRepoOwner}/{currentRepoName}</strong>
          </p>
          <button className="use-current-repo-btn" onClick={handleUseCurrentRepo}>Change</button>
        </div>
      )}

      <input ref={tokenRef} type="password" placeholder="Your Personal access token" value={token} onChange={(e) => setToken(e.target.value)} onKeyDown={(e) => handleKeyDown(e, 0)}/>
      <input ref={repoOwnerRef} type="text" placeholder="Repository owner" value={repoOwner} onChange={(e) => setRepoOwner(e.target.value)} onKeyDown={(e) => handleKeyDown(e, 1)}/>
      <input ref={repoNameRef} type="text" placeholder="Repository name" value={repoName} onChange={(e) => setRepoName(e.target.value)} onKeyDown={(e) => handleKeyDown(e, 2)}/>
      <input ref={keywordRef} type="text" placeholder="Keyword" value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={(e) => handleKeyDown(e, 3)}/>
      <button onClick={handleSearch} disabled={loading}>{loading ? "Loading..." : "Search"}</button>
      
      <SearchResults results={results} />
    </div>
  );
};

export default Popup;
