import { useEffect, useState } from "react";
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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
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
            Current Repo: <strong>{currentRepoOwner}/{currentRepoName}</strong>
          </p>
          <button className="use-current-repo-btn" onClick={handleUseCurrentRepo}>Change</button>
        </div>
      )}
      <input type="password" placeholder="Personal access tokens" value={token} onChange={(e) => setToken(e.target.value)} />
      <input type="text" placeholder="Repository owner" value={repoOwner} onChange={(e) => setRepoOwner(e.target.value)} />
      <input type="text" placeholder="Repository name" value={repoName} onChange={(e) => setRepoName(e.target.value)} />
      <input type="text" placeholder="Keyword" value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={handleKeyDown}/>
      <button onClick={handleSearch} disabled={loading}>{loading ? "Loading..." : "Search"}</button>
      
      <SearchResults results={results} />
    </div>
  );
};

export default Popup;
