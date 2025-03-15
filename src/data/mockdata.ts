export const mockToken = "mock_github_token";

export const mockRepoInfo = {
    repoOwner: "spongebob",
    repoName: "springBoot",
    keyword: "b",
    results: [
      { type: "commit", author: "jingjing2", message: "Fix bug", url: "#" },
      { type: "comment", author: "spongebob", message: "bb!", url: "#" },
    ],
    userInfo: {
        login: "swn",
        avatar_url: "https://avatars.githubusercontent.com/u/1?v=4",
    },
  };  

export const mockResults = [
    {
      type: "commit",
      author: "user123",
      message: "Fix bug in authentication system",
      url: "https://github.com/user123/repo/commit/1a2b3c",
    },
    {
      type: "commit",
      author: "dev567",
      message: "Refactor database schema",
      url: "https://github.com/dev567/repo/commit/4d5e6f",
    },
    {
      type: "comment",
      author: "reviewer42",
      message: "I think this needs some improvement.",
      url: "https://github.com/user123/repo/issues/10#comment-789",
    },
  ];
  