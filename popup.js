let cachedCommits = []; // 캐싱된 커밋 데이터 저장소
let lastRepoOwner = ""; // 마지막으로 검색한 레포지토리 소유자
let lastRepoName = ""; // 마지막으로 검색한 레포지토리 이름
let apiCallCount = 0; // API 호출 횟수 확인
let isLoading = false; // 검색 중 여부

document.addEventListener("DOMContentLoaded", function () {
    document.body.style.backgroundColor = "#0d1117"; // 강제 다크 모드 적용
    document.body.style.color = "#c9d1d9"; // 텍스트 색상도 다크 모드 적용

    chrome.storage.sync.get(["githubToken"], function (data) {
        if (data.githubToken) {
            document.getElementById("tokenInput").value = data.githubToken;
        }
    });

    document.getElementById("saveToken").addEventListener("click", function () {
        const token = document.getElementById("tokenInput").value;
        if (!token) {
            alert("GitHub Personal Access Token을 입력하세요!");
            return;
        }

        chrome.storage.sync.set({ githubToken: token }, function () {
            alert("토큰이 저장되었습니다!");
        });
    });

    document.getElementById("searchButton").addEventListener("click", async function () {
        if (isLoading) return; // 🔥 검색 중이면 중복 실행 방지
        isLoading = true;
        document.getElementById("searchButton").disabled = true;
        document.getElementById("searchButton").textContent = "검색 중...";

        const keyword = document.getElementById("searchInput").value;
        const repoOwner = document.getElementById("repoOwner").value;
        const repoName = document.getElementById("repoName").value;

        if (!keyword || !repoOwner || !repoName) {
            alert("모든 필드를 입력하세요!");
            resetButton();
            return;
        }

        chrome.storage.sync.get(["githubToken"], async function (data) {
            const token = data.githubToken;
            if (!token) {
                alert("⚠️ GitHub Personal Access Token이 필요합니다!");
                resetButton();
                return;
            }

            const resultsList = document.getElementById("results");
            resultsList.innerHTML = "";
            let found = false;

            // 기존 데이터 활용 여부 확인
            if (repoOwner === lastRepoOwner && repoName === lastRepoName && cachedCommits.length > 0) {
                console.log("🔄 기존 캐싱된 데이터 활용 (API 호출 없음)");
            } else {
                console.log("🌐 API 호출: 새로운 레포 검색");
                apiCallCount = 0;
                let page = 1;
                cachedCommits = [];
                lastRepoOwner = repoOwner;
                lastRepoName = repoName;

                while (page <= 10) {
                    console.log(`🔄 ${page}번째 페이지 요청 중...`);
                    apiCallCount++;

                    const commitResponse = await fetch(
                        `https://api.github.com/repos/${repoOwner}/${repoName}/commits?per_page=100&page=${page}`,
                        {
                            headers: {
                                "Accept": "application/vnd.github.v3+json",
                                "Authorization": `Bearer ${token}`
                            }
                        }
                    );

                    if (commitResponse.status === 403) {
                        console.warn("⚠️ GitHub API Rate Limit 초과! 1분 후 재시도...");
                        await new Promise(resolve => setTimeout(resolve, 60000));
                        continue;
                    }

                    if (!commitResponse.ok) {
                        throw new Error(`❌ API 요청 실패: ${commitResponse.status}`);
                    }

                    const commits = await commitResponse.json();
                    if (commits.length === 0) break;

                    cachedCommits = cachedCommits.concat(commits);
                    page++;

                    await new Promise(resolve => setTimeout(resolve, 1000));
                    if (cachedCommits.length >= 1000) break;
                }

                console.log(`✅ API 호출 완료 (총 ${apiCallCount}회)`);
                resetButton();
            }

            // 기존 데이터에서 검색 수행
            for (const commit of cachedCommits) {
                if (commit.commit.message.includes(keyword)) {
                    found = true;
                    displayResult("commit", commit.commit.author.name, commit.commit.message, commit.html_url);
                }

                // 해당 커밋의 코멘트 검색
                const commitSHA = commit.sha;
                const commitCommentResponse = await fetch(
                    `https://api.github.com/repos/${repoOwner}/${repoName}/commits/${commitSHA}/comments`,
                    {
                        headers: {
                            "Accept": "application/vnd.github.v3+json",
                            "Authorization": `Bearer ${token}`
                        }
                    }
                );

                if (commitCommentResponse.ok) {
                    const commitComments = await commitCommentResponse.json();
                    commitComments.forEach(comment => {
                        if (comment.body.includes(keyword)) {
                            found = true;
                            displayResult("comment", comment.user.login, comment.body, comment.html_url);
                        }
                    });
                }
            }

            if (!found) {
                resultsList.innerHTML = `<li>🔍 검색 결과 없음</li>`;
            }

            resetButton();
        });
    });
});

function resetButton() {
    console.log("✅ 검색 종료 - 버튼 활성화 실행됨");
    isLoading = false;
    const searchButton = document.getElementById("searchButton");
    if (!searchButton) {
        console.error("❌ 검색 버튼을 찾을 수 없습니다!");
        return;
    }
    searchButton.disabled = false;
    searchButton.textContent = "🔍 검색";
}


// 검색 결과를 UI에 표시하는 함수
function displayResult(type, author, message, url) {
    const resultsList = document.getElementById("results");
    const li = document.createElement("li");
    const icon = document.createElement("span");
    const link = document.createElement("a");

    icon.className = "icon";
    icon.textContent = type === "commit" ? "[Commit]" : "[Comment]";

    li.className = "search-result"; 

    li.appendChild(icon);

    const content = document.createElement("div");
    content.innerHTML = `<strong>${author}:</strong> ${message}`;

    li.appendChild(content);
    
    if (url) {
        link.href = url;
        link.target = "_blank";
        link.textContent = "🔗 이동";
        li.appendChild(link);
    }

    resultsList.appendChild(li);
}

console.log("✅ GitHub Commit & Comment Search 실행됨!");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("📢 메시지 수신됨:", message);
});
