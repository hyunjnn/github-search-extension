chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "searchCommits") {
    const { repoOwner, repoName, keyword, token } = request;

    // 로컬 스토리지에서 기존 데이터 가져오기
    chrome.storage.local.get(["lastRepoOwner", "lastRepoName", "lastCommits", "lastComments"], (storedData) => {
      // 1. 직전에 검색한 레포와 동일한 레포라면
      if (storedData.lastRepoOwner === repoOwner && storedData.lastRepoName === repoName) {
        console.log(`동일 레포 검색, API 요청 생략: ${repoOwner}/${repoName}`);

        // 기존 검색 결과에서 키워드 필터링 수행 및 결과 반환
        const filteredCommits = storedData.lastCommits.filter(commit =>
          commit.message.toLowerCase().includes(keyword.toLowerCase())
        );

        const filteredComments = storedData.lastComments.filter(comment =>
          comment.message.toLowerCase().includes(keyword.toLowerCase())
        );

        sendResponse({ results: [...filteredCommits, ...filteredComments] });
        return;
      }

      // 2. 직전에 검색한 레포와 다른 새로운 레포라면면
      console.log(`새로운 레포 검색, API 요청 시작: ${repoOwner}/${repoName}`);
      let allCommits = [];
      let allComments = [];
      let page = 1;

      const fetchAllCommits = async () => {
        while (true) {
          const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/commits?per_page=100&page=${page}`;
          const response = await fetch(apiUrl, {
            headers: {
              Authorization: `token ${encodeURIComponent(token)}`,
              Accept: "application/vnd.github.v3+json"
            },
          });

          const commits = await response.json();
          if (!Array.isArray(commits) || commits.length === 0) break; // 데이터가 없으면 종료

          allCommits = allCommits.concat(commits.map(commit => ({
            type: "commit",
            author: commit.commit.author.name,
            message: commit.commit.message,
            url: commit.html_url,
            sha: commit.sha
          })));

          console.log(`${page} 페이지의 커밋 데이터 가져옴: ${commits.length}개`);
          page++; // 다음 페이지 요청
        }
      };

      const fetchAllComments = async () => {
        const commentRequests = allCommits.map(commit =>
          fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/commits/${commit.sha}/comments`, {
            headers: {
              Authorization: `token ${encodeURIComponent(token)}`,
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
              console.error(`${commit.sha} 코멘트 가져오기 실패:`, error);
              return [];
            })
        );

        const allCommentsArray = await Promise.all(commentRequests);
        allComments = allCommentsArray.flat(); // 2D 배열을 1D 배열로 변환
        console.log(`모든 코멘트 데이터 가져옴: ${allComments.length}개`);
      };

      (async () => {
        await fetchAllCommits(); // 모든 커밋 가져오기
        await fetchAllComments(); // 모든 코멘트 가져오기

        // 검색 키워드로 필터링
        const filteredCommits = allCommits.filter(commit =>
          commit.message.toLowerCase().includes(keyword.toLowerCase())
        );

        const filteredComments = allComments.filter(comment =>
          comment.message.toLowerCase().includes(keyword.toLowerCase())
        );

        console.log("필터링된 커밋:", filteredCommits);
        console.log("필터링된 코멘트:", filteredComments);

        // 검색 결과 및 레포 정보 저장(팝업 닫아도 유지되도록)
        chrome.storage.local.set({
          lastRepoOwner: repoOwner,
          lastRepoName: repoName,
          lastCommits: allCommits,
          lastComments: allComments
        });

        // 필터링된 검색색 결과 반환
        sendResponse({ results: [...filteredCommits, ...filteredComments] });
      })().catch(error => {
        console.error("[Error] API 요청 실패:", error);
        sendResponse({ error: error.message });
      });
    });

    return true; // 비동기 응답을 위해 true 반환
  }
});
