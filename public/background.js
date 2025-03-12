const oAuth2 = {
  init() {
    this.KEY = "GitHub_Access_Token";
    this.AUTHORIZATION_URL = "https://github.com/login/oauth/authorize";
    this.ACCESS_TOKEN_URL = "https://github.com/login/oauth/access_token";
    this.PROFILE_URL = "https://api.github.com/user";
    this.CLIENT_ID = "Ov23liUzqzkQ6f6TJCuB"; // dev
    this.CLIENT_SECRET = "84416824a413a891339f1a2fe67b8bf95aa5c5ea"; //dev
    // this.CLIENT_ID = "Ov23li369RAOVkkLFDHl"; // deploy
    // this.CLIENT_SECRET = "265b36c89f77c24eb4624de6f03a7abe20220947"; // deploy
    this.REDIRECT_URL = `https://${chrome.runtime.id}.chromiumapp.org/`;
    this.SCOPES = ["repo"];
  },

  begin() {
    this.init();
    const authUrl = `${this.AUTHORIZATION_URL}?client_id=${
      this.CLIENT_ID
    }&redirect_uri=${encodeURIComponent(
      this.REDIRECT_URL
    )}&scope=${this.SCOPES.join(" ")}`;

    chrome.tabs.create({ url: authUrl, active: true }, (tab) => {
      chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
        if (
          tabId === tab.id &&
          changeInfo.url &&
          changeInfo.url.startsWith(oAuth2.REDIRECT_URL)
        ) {
          const urlParams = new URL(changeInfo.url).searchParams;
          const code = urlParams.get("code");

          if (code) {
            oAuth2.requestToken(code);
            chrome.tabs.update(tabId, { url: "https://github.com/" });
          }

          chrome.tabs.onUpdated.removeListener(listener);
        }
      });
    });
  },

  requestToken(code) {
    fetch(this.ACCESS_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: this.CLIENT_ID,
        client_secret: this.CLIENT_SECRET,
        code,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.access_token) {
          this.saveToken(data.access_token);
          console.log("GitHub Access Token 저장 완료");
        } else {
          console.error("OAuth 토큰 요청 실패:", data);
        }
      })
      .catch((error) => console.error("OAuth 토큰 요청 중 오류 발생:", error));
  },

  getUserInfo(token) {
    return fetch(this.PROFILE_URL, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    })
      .then((response) => response.json())
      .then((user) => {
        if (user && user.login) {
          console.log("GitHub 사용자 정보 가져오기 성공:", user);
          chrome.storage.local.set({ GitHub_User_Info: user });
        }
      })
      .catch((error) =>
        console.error("GitHub 사용자 정보 가져오기 실패:", error)
      );
  },

  saveToken(token) {
    chrome.storage.local.set({ GitHub_Access_Token: token }, () => {
      console.log("GitHub Access Token 저장 완료");
      this.getUserInfo(token);
    });
  },
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "beginOAuth2") {
    oAuth2.begin();
  }
  if (request.action === "searchCommits") {
    const { repoOwner, repoName, keyword, token } = request;

    chrome.storage.local.get(
      ["lastRepoOwner", "lastRepoName", "lastCommits", "lastComments"],
      (storedData) => {
        // 직전에 검색한 레포와 동일한 레포라면
        if (
          storedData.lastRepoOwner === repoOwner &&
          storedData.lastRepoName === repoName
        ) {
          console.log(
            `동일 레포 검색, API 요청 생략: ${repoOwner}/${repoName}`
          );

          // 기존 검색 결과에서 키워드 필터링 수행 및 결과 반환
          const filteredCommits = storedData.lastCommits.filter((commit) =>
            commit.message.toLowerCase().includes(keyword.toLowerCase())
          );

          const filteredComments = storedData.lastComments.filter((comment) =>
            comment.message.toLowerCase().includes(keyword.toLowerCase())
          );

          sendResponse({ results: [...filteredCommits, ...filteredComments] });
          return;
        }

        // 직전에 검색한 레포와 다른 새로운 레포라면
        console.log(
          `새로운 레포 검색, API 요청 시작: ${repoOwner}/${repoName}`
        );
        let allCommits = [];
        let allComments = [];
        let page = 1;

        const fetchAllCommits = async () => {
          while (true) {
            const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/commits?per_page=100&page=${page}`;
            const response = await fetch(apiUrl, {
              headers: {
                Authorization: `token ${encodeURIComponent(token)}`,
                Accept: "application/vnd.github.v3+json",
              },
            });

            const commits = await response.json();
            if (!Array.isArray(commits) || commits.length === 0) break; // 데이터가 없으면 종료

            allCommits = allCommits.concat(
              commits.map((commit) => ({
                type: "commit",
                author: commit.commit.author.name,
                message: commit.commit.message,
                url: commit.html_url,
                sha: commit.sha,
              }))
            );

            console.log(
              `${page} 페이지의 커밋 데이터 가져옴: ${commits.length}개`
            );
            page++; // 다음 페이지 요청
          }
        };

        const fetchAllComments = async () => {
          const commentRequests = allCommits.map((commit) =>
            fetch(
              `https://api.github.com/repos/${repoOwner}/${repoName}/commits/${commit.sha}/comments`,
              {
                headers: {
                  Authorization: `token ${encodeURIComponent(token)}`,
                  Accept: "application/vnd.github.v3+json",
                },
              }
            )
              .then((res) => res.json())
              .then((comments) => {
                if (Array.isArray(comments)) {
                  return comments.map((comment) => ({
                    type: "comment",
                    author: comment.user.login,
                    message: comment.body,
                    url: comment.html_url,
                  }));
                }
                return [];
              })
              .catch((error) => {
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
          const filteredCommits = allCommits.filter((commit) =>
            commit.message.toLowerCase().includes(keyword.toLowerCase())
          );

          const filteredComments = allComments.filter((comment) =>
            comment.message.toLowerCase().includes(keyword.toLowerCase())
          );

          console.log("필터링된 커밋:", filteredCommits);
          console.log("필터링된 코멘트:", filteredComments);

          // 검색 결과 및 레포 정보 저장(팝업 닫아도 유지되도록)
          chrome.storage.local.set({
            lastRepoOwner: repoOwner,
            lastRepoName: repoName,
            lastCommits: allCommits,
            lastComments: allComments,
          });

          // 필터링된 검색 결과 반환
          sendResponse({ results: [...filteredCommits, ...filteredComments] });
        })().catch((error) => {
          console.error("[Error] API 요청 실패:", error);
          sendResponse({ error: error.message });
        });
      }
    );

    return true; // 비동기 응답
  }
});
