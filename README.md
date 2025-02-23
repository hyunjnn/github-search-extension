# 🔎 GitHub Commit & Comment Search - 내가 쓴 코멘트 빨리 찾기

GitHub에서 특정 키워드가 포함된 **커밋 메시지 & 커밋 코멘트**를 빠르게 검색할 수 있는 Chrome 확장 프로그램입니다.   

어떤 기능을 구현한 코드를 찾고 싶은데, **언제 구현**되었는지 정확한 커밋 시점을 모르거나 **커밋 기록이 너무 많아** 페이지를 넘겨가며 찾기 어려울 때 유용합니다.
또한, feat과 같은 커밋 컨벤션을 활용하여 프로젝트의 **기능이 추가된 흐름**을 **한눈에 파악**할 수도 있습니다.
  
## ✨ 제공 기능

✔️ 찾고자하는 GitHub 커밋 메시지 및 커밋 코멘트 검색 시 링크 제공  
✔️ **자신의 비공개 레포지토리도 검색 가능 (GitHub Personal Access Token 필요)**  
✔️ 검색 결과를 클릭하면 해당 링크로 바로 이동  

➕ OAuth2를 활용하여 직접 토큰을 입력하지 않고 인증하도록 프로젝트 수정 가능

## 🚀 **설치 방법**

### 1. **GitHub에서 코드 다운로드**

```sh
git clone https://github.com/hs-2171098-hyunjinchoi/github-comment-search.git
cd github-comment-search
```

### 2. 의존성 설치 및 빌드

```sh
npm install
npm run build
```

### 3. 크롬 확장 프로그램 추가

    1. chrome://extensions로 이동
    2. 오른쪽 상단의 "개발자 모드 활성화" 버튼 클릭
    3. 왼쪽 상단의 "압축해제된 확장 프로그램을 로드합니다." 버튼 클릭
    4. 빌드 후 생성된 dist 폴더 선택

## 🔑 GitHub Personal Access Token 발급 방법

    1. GitHub Personal Access Token 생성 페이지로 이동
    2. Generate new token 클릭 (GitHub API v3 권한 설정 필요)
    3. 필요한 권한 선택
      - repo → 비공개 레포지토리 검색 시 필요
      - read:org → 조직 내 레포지토리 검색 시 필요
