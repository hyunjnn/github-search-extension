export const getRepoInfoFromUrl = () => {
  return new Promise<{ repoOwner: string; repoName: string }>((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0]?.url || "";
      const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (match) {
        resolve({ repoOwner: match[1], repoName: match[2] });
      } else {
        resolve({ repoOwner: "", repoName: "" });
      }
    });
  });
};