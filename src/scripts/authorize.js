(() => {
  if (!window.location.search.includes("code=")) return;

  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");

  if (code) {
    console.log("감지된 인가 코드:", code);

    chrome.runtime.sendMessage({ action: "githubOAuthCode", code });

    window.history.replaceState({}, document.title, "/");
  }
})();
