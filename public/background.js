chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "searchCommits") {
    fetch(`https://api.github.com/repos/${request.repoOwner}/${request.repoName}/commits?per_page=100`, {
      headers: {
        Authorization: `token ${encodeURIComponent(request.token)}`,  // 토큰 인코딩
        "Content-Type": "application/json", // JSON 요청으로 지정
        Accept: "application/vnd.github.v3+json" // GitHub API 요청으로 지정
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("🔄 API 응답 데이터:", data); 
        sendResponse({ results: data });
      })
      .catch((error) => {
        console.error("❌ API 요청 실패:", error);
        sendResponse({ error: error.message });
      });

    return true; // 비동기 응답을 위해 true 반환
  }
});
