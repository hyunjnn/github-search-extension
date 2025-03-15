import axios from "axios";

export const GitHubOAuth = {
  AUTHORIZATION_URL: "https://github.com/login/oauth/authorize",
  ACCESS_TOKEN_URL: "https://github.com/login/oauth/access_token",
  PROFILE_URL: "https://api.github.com/user",
  CLIENT_ID: "Ov23liUzqzkQ6f6TJCuB", // dev
  CLIENT_SECRET: "84416824a413a891339f1a2fe67b8bf95aa5c5ea", // dev
  //   CLIENT_ID: "Ov23li369RAOVkkLFDHl", // deploy
  //   CLIENT_SECRET: "265b36c89f77c24eb4624de6f03a7abe20220947", // deploy
  REDIRECT_URL: "https://github.com/",
  SCOPES: ["repo"],

  beginOAuth: async () => {
    const authUrl = `${GitHubOAuth.AUTHORIZATION_URL}?client_id=${
      GitHubOAuth.CLIENT_ID
    }&redirect_uri=${encodeURIComponent(
      GitHubOAuth.REDIRECT_URL
    )}&scope=${GitHubOAuth.SCOPES.join(" ")}`;

    await chrome.tabs.create({ url: authUrl, active: true });
  },

  requestToken: async (code) => {
    try {
      const response = await axios.post(
        GitHubOAuth.ACCESS_TOKEN_URL,
        {
          client_id: GitHubOAuth.CLIENT_ID,
          client_secret: GitHubOAuth.CLIENT_SECRET,
          code,
        },
        {
          headers: { Accept: "application/json" },
        }
      );

      if (response.data.access_token) {
        await GitHubOAuth.saveToken(response.data.access_token);
        console.log("GitHub Access Token 저장 완료");
      } else {
        console.error("OAuth 토큰 요청 실패:", response.data);
      }
    } catch (error) {
      console.error("OAuth 토큰 요청 중 오류 발생:", error);
    }
  },

  getUserInfo: async (token) => {
    try {
      const response = await axios.get(GitHubOAuth.PROFILE_URL, {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (response.data && response.data.login) {
        console.log("GitHub 사용자 정보 가져오기 성공:", response.data);
        await chrome.storage.local.set({ GitHub_User_Info: response.data });
      }
    } catch (error) {
      console.log("GitHub 사용자 정보 가져오기 실패:", error);
    }
  },

  saveToken: async (token) => {
    await chrome.storage.local.set({ GitHub_Access_Token: token });
    console.log("GitHub Access Token 저장 완료");
    await GitHubOAuth.getUserInfo(token);
  },
};
