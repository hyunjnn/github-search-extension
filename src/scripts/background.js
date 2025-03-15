import { GitHubAPI } from "../utils/githubAPI";
import { GitHubOAuth } from "../utils/githubAuth";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "beginOAuth2") {
    GitHubOAuth.beginOAuth();
  }
  if (request.action === "githubOAuthCode") {
    console.log("백그라운드에서 인가 코드 수신:", request.code);
    GitHubOAuth.requestToken(request.code);
  }
  if (request.action === "searchCommits") {
    const { repoOwner, repoName, keyword, token } = request;

    chrome.storage.local.get(
      ["lastRepoOwner", "lastRepoName", "lastCommits", "lastComments"],
      async (storedData) => {
        if (
          storedData.lastRepoOwner === repoOwner &&
          storedData.lastRepoName === repoName
        ) {
          console.log(
            `동일 레포 검색, API 요청 생략: ${repoOwner}/${repoName}`
          );
          const filteredCommits = storedData.lastCommits.filter((commit) =>
            commit.message.toLowerCase().includes(keyword.toLowerCase())
          );
          const filteredComments = storedData.lastComments.filter((comment) =>
            comment.message.toLowerCase().includes(keyword.toLowerCase())
          );
          sendResponse({ results: [...filteredCommits, ...filteredComments] });
          return;
        }

        console.log(
          `새로운 레포 검색, API 요청 시작: ${repoOwner}/${repoName}`
        );

        try {
          const allCommits = await GitHubAPI.fetchAllCommits(
            repoOwner,
            repoName,
            token
          );
          const allComments = await GitHubAPI.fetchAllComments(
            repoOwner,
            repoName,
            token,
            allCommits
          );

          const filteredCommits = allCommits.filter((commit) =>
            commit.message.toLowerCase().includes(keyword.toLowerCase())
          );
          const filteredComments = allComments.filter((comment) =>
            comment.message.toLowerCase().includes(keyword.toLowerCase())
          );

          chrome.storage.local.set({
            lastRepoOwner: repoOwner,
            lastRepoName: repoName,
            lastCommits: allCommits,
            lastComments: allComments,
          });

          sendResponse({ results: [...filteredCommits, ...filteredComments] });
        } catch (error) {
          console.error("[Error] API 요청 실패:", error);
          sendResponse({ error: error.message });
        }
      }
    );

    return true;
  }
});
