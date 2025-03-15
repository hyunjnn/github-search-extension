import axios from "axios";

export const GitHubAPI = {
  fetchAllCommits: async (repoOwner, repoName, token) => {
    let allCommits = [];
    let page = 1;
    while (true) {
      const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/commits?per_page=100&page=${page}`;
      try {
        const response = await axios.get(apiUrl, {
          headers: {
            Authorization: `token ${encodeURIComponent(token)}`,
            Accept: "application/vnd.github.v3+json",
          },
        });

        if (!Array.isArray(response.data) || response.data.length === 0) break;

        allCommits = allCommits.concat(
          response.data.map((commit) => ({
            type: "commit",
            author: commit.commit.author.name,
            message: commit.commit.message,
            url: commit.html_url,
            sha: commit.sha,
          }))
        );

        page++;
      } catch (error) {
        console.error("커밋 데이터 가져오기 실패:", error);
        break;
      }
    }
    return allCommits;
  },

  fetchAllComments: async (repoOwner, repoName, token, commits) => {
    const commentRequests = commits.map((commit) =>
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
        .then((comments) =>
          Array.isArray(comments)
            ? comments.map((comment) => ({
                type: "comment",
                author: comment.user.login,
                message: comment.body,
                url: comment.html_url,
              }))
            : []
        )
        .catch((error) => {
          console.error(`${commit.sha} 코멘트 가져오기 실패:`, error);
          return [];
        })
    );

    const allCommentsArray = await Promise.all(commentRequests);
    return allCommentsArray.flat();
  },
};
