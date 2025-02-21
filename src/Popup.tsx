import { useState } from "react";
import "./style.css";
import SearchResults from "./components/SearchResults";

// GitHub API 응답 타입 정의
interface CommitData {
  sha: string;
  html_url: string;
  commit: {
    author: {
      name: string;
    };
    message: string;
  };
}

interface CommentData {
  body: string;
  user: {
    login: string;
  };
  html_url: string;
}

// 검색 결과 데이터 타입
interface SearchResult {
  type: "commit" | "comment";
  author: string;
  message: string;
  url: string;
}

const Popup = () => {
  const [token, setToken] = useState("");
  const [repoOwner, setRepoOwner] = useState("");
  const [repoName, setRepoName] = useState("");
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

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
      async (response: { error?: string; results?: CommitData[] }) => {
        setLoading(false);

        if (response.error) {
          alert("Error: " + response.error);
          return;
        }

        console.log("🔍 Original response data:", response.results);

        let filteredResults: SearchResult[] = [];

        // 커밋 메시지에서 검색어 필터링
        const commitMatches: SearchResult[] = (response.results ?? [])
          .filter((commit) =>
            commit.commit.message.toLowerCase().includes(keyword.toLowerCase())
          )
          .map((commit) => ({
            type: "commit",
            author: commit.commit.author.name,
            message: commit.commit.message,
            url: commit.html_url,
          }));

        filteredResults = [...filteredResults, ...commitMatches];

        // 각 커밋의 코멘트 검색
        const commentMatches: SearchResult[] = [];
        await Promise.all(
          (response.results ?? []).map(async (commit) => {
            const commitSHA = commit.sha;
            const commentResponse = await fetch(
              `https://api.github.com/repos/${repoOwner}/${repoName}/commits/${commitSHA}/comments`,
              {
                headers: {
                  Accept: "application/vnd.github.v3+json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (commentResponse.ok) {
              const commitComments: CommentData[] = await commentResponse.json();
              commitComments.forEach((comment) => {
                if (comment.body.toLowerCase().includes(keyword.toLowerCase())) {
                  commentMatches.push({
                    type: "comment",
                    author: comment.user.login,
                    message: comment.body,
                    url: comment.html_url,
                  });
                }
              });
            }
          })
        );

        filteredResults = [...filteredResults, ...commentMatches];
        console.log("✅ Filtered Results:", filteredResults);

        if (filteredResults.length === 0) {
          alert("No search results.");
        }

        setResults(filteredResults);
      }
    );
  };

  return (
    <div className="popup-container">
      <h2>GitHub Commit & Comment Search</h2>
      <input type="password" placeholder="Personal access tokens" value={token} onChange={(e) => setToken(e.target.value)} />
      <input type="text" placeholder="Repository owner" value={repoOwner} onChange={(e) => setRepoOwner(e.target.value)} />
      <input type="text" placeholder="Repository name" value={repoName} onChange={(e) => setRepoName(e.target.value)} />
      <input type="text" placeholder="Keyword" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
      <button onClick={handleSearch} disabled={loading}>{loading ? "Loading..." : "Search"}</button>
      
      <SearchResults results={results} />
    </div>
  );
};

export default Popup;
