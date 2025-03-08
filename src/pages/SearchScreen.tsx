import { useEffect, useState, useRef } from "react";
import SearchResults from "../components/SearchResults";
import { mockRepoInfo } from "../assets/mockData";
import UserProfile from "../components/UserProfile";
import RepoAlert from "../components/RepoAlert";

interface SearchScreenProps {
  token: string;
}

interface SearchResult {
  type: string;
  author: string;
  message: string;
  url: string;
}

const getRepoInfoFromUrl = () => {
  return new Promise<{ repoOwner: string; repoName: string }>((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0]?.url || "";
      const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (match) {
        resolve({ repoOwner: match[1], repoName: match[2] });
      } else {
        resolve({ repoOwner: "", repoName: "" });
      }
    });
  });
};

const SearchScreen: React.FC<SearchScreenProps> = ({ token }) => {
  const [userInfo, setUserInfo] = useState<{
    login: string;
    avatar_url: string;
  } | null>(null);

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
    if (import.meta.env.MODE === "development") {
      console.warn("Vite Dev Env: Using Mock User Data");
      setUserInfo(mockRepoInfo.userInfo);
    } else {
      chrome.storage.local.get(["GitHub_User_Info"], (data) => {
        if (data.GitHub_User_Info) {
          setUserInfo(data.GitHub_User_Info);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (import.meta.env.MODE === "development") {
      console.warn("Vite Dev Env: Using Mock Data");
      setRepoOwner(mockRepoInfo.repoOwner);
      setRepoName(mockRepoInfo.repoName);
      setKeyword(mockRepoInfo.keyword);
      setResults(mockRepoInfo.results);
    } else {
      chrome.storage.local.get(
        ["repoOwner", "repoName", "keyword", "results"],
        (data) => {
          if (data.repoOwner) setRepoOwner(data.repoOwner);
          if (data.repoName) setRepoName(data.repoName);
          if (data.keyword) setKeyword(data.keyword);
          if (data.results) setResults(data.results);
        }
      );

      getRepoInfoFromUrl().then(({ repoOwner, repoName }) => {
        setCurrentRepoOwner(repoOwner);
        setCurrentRepoName(repoName);
      });
    }
    keywordRef.current?.focus();
  }, []);

  useEffect(() => {
    if (import.meta.env.MODE === "development") {
    } else {
      chrome.storage.local.set({ repoOwner, repoName, keyword, results });
    }
  }, [repoOwner, repoName, keyword, results]);

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    refIndex: number
  ) => {
    if (event.key === "Enter") {
      handleSearch();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      switch (refIndex) {
        case 0:
          repoNameRef.current?.focus();
          break;
        case 1:
          keywordRef.current?.focus();
          break;
      }
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      switch (refIndex) {
        case 1:
          repoOwnerRef.current?.focus();
          break;
        case 2:
          repoNameRef.current?.focus();
          break;
      }
    }
  };

  const handleUseCurrentRepo = () => {
    setRepoOwner(currentRepoOwner);
    setRepoName(currentRepoName);
    setKeyword("");
    setResults([]);
  };

  const handleSearch = () => {
    if (!repoOwner || !repoName || !keyword) {
      alert("Please fill out all fields!");
      return;
    }

    setLoading(true);
    setResults([]);

    if (import.meta.env.MODE === "development") {
      setTimeout(() => {
        setLoading(false);
        setResults(mockRepoInfo.results);
      }, 1000);
    } else {
      chrome.runtime.sendMessage(
        { action: "searchCommits", token, repoOwner, repoName, keyword },
        (response) => {
          setLoading(false);
          if (response.error) {
            alert("Error: " + response.error);
            return;
          }
          setResults(response.results);
        }
      );
    }
  };

  return (
    <>
      <UserProfile userInfo={userInfo} />
      <RepoAlert
        currentRepoOwner={currentRepoOwner}
        currentRepoName={currentRepoName}
        repoOwner={repoOwner}
        repoName={repoName}
        onSwitchRepo={handleUseCurrentRepo}
      />

      <div className="search-screen">
        <div className="repo-input-container">
          <input
            ref={repoOwnerRef}
            type="text"
            placeholder="Repository owner"
            value={repoOwner}
            onChange={(e) => setRepoOwner(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, 0)}
          />
          <span className="repo-slash">/</span>
          <input
            ref={repoNameRef}
            type="text"
            placeholder="Repository name"
            value={repoName}
            onChange={(e) => setRepoName(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, 1)}
          />
        </div>

        <input
          className="keyword"
          ref={keywordRef}
          type="text"
          placeholder="Keyword"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, 2)}
        />
        <button
          className="search-btn"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? "Loading..." : "Search"}
        </button>

        <SearchResults results={results} />
      </div>
    </>
  );
};

export default SearchScreen;
