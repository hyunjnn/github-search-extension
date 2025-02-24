chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "searchCommits") {
    let apiUrl = `https://api.github.com/repos/${request.repoOwner}/${request.repoName}/commits?per_page=100`;
    let allCommits = [];

    fetch(apiUrl, {
      headers: {
        Authorization: `token ${encodeURIComponent(request.token)}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github.v3+json"
      },
    })
      .then((res) => res.json())
      .then(async (commits) => {
        if (!Array.isArray(commits)) {
          sendResponse({ error: "Invalid API response" });
          return;
        }

        // 커밋 리스트 저장
        allCommits = commits.map(commit => ({
          type: "commit",
          author: commit.commit.author.name,
          message: commit.commit.message,
          url: commit.html_url,
          sha: commit.sha // 코멘트 가져오기 위한 SHA 값 저장
        }));

        console.log("커밋 데이터 가져옴:", allCommits);

        // 각 커밋의 코멘트 가져오기 (병렬 요청)
        const commentRequests = allCommits.map(commit =>
          fetch(`https://api.github.com/repos/${request.repoOwner}/${request.repoName}/commits/${commit.sha}/comments`, {
            headers: {
              Authorization: `token ${encodeURIComponent(request.token)}`,
              Accept: "application/vnd.github.v3+json"
            },
          })
            .then(res => res.json())
            .then(comments => {
              if (Array.isArray(comments)) {
                return comments.map(comment => ({
                  type: "comment",
                  author: comment.user.login,
                  message: comment.body,
                  url: comment.html_url
                }));
              }
              return [];
            })
            .catch(error => {
              console.error(`[Error] ${commit.sha} 코멘트 가져오기 실패:`, error);
              return [];
            })
        );

        // 모든 코멘트 요청이 끝난 후 결과 합치기
        const allComments = await Promise.all(commentRequests);
        const flattenedComments = allComments.flat(); // 2D 배열을 1D 배열로 변환

        console.log("코멘트 데이터 가져옴:", flattenedComments);

        // 검색 키워드로 필터링
        const filteredCommits = allCommits.filter(commit =>
          commit.message.toLowerCase().includes(request.keyword.toLowerCase())
        );

        const filteredComments = flattenedComments.filter(comment =>
          comment.message.toLowerCase().includes(request.keyword.toLowerCase())
        );

        console.log("필터링된 커밋:", filteredCommits);
        console.log("필터링된 코멘트:", filteredComments);

        // 필터링 결과 반환
        sendResponse({ results: [...filteredCommits, ...filteredComments] });
      })
      .catch(error => {
        console.error("[Error] API 요청 실패:", error);
        sendResponse({ error: error.message });
      });

    return true; // 비동기 응답을 위해 true 반환
  }
});
