# 🔎 GitHub Commit & Comment Search - 내가 쓴 코멘트 빨리 찾기

GitHub에서 특정 키워드가 포함된 **커밋 메시지 & 커밋 코멘트**를 빠르게 검색할 수 있는 **Chrome 확장 프로그램**입니다. 코멘트에 기록용으로 남긴 내용을 다시 보고 싶은데, 커밋 기록이 너무 많아 찾기 어려울 때, 이 프로그램을 사용하여 빠르게 찾을 수 있습니다.

### ✨ 제공 기능

✔️ 찾고자하는 GitHub 커밋 메시지 및 커밋 코멘트 검색 시 링크 제공  
✔️ **자신의 비공개 레포지토리도 검색 가능 (GitHub Personal Access Token 필요)**  
✔️ 검색 결과를 클릭하면 해당 링크로 바로 이동

➕ **보안 개선 필요**  
➕ **UI/UX 개선 필요**  
➕ **검색 속도 개선 필요**

---

## **설치 방법**

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

# 🔑 GitHub Personal Access Token 설정 방법

### 1. GitHub에서 Personal Access Token 발급하기

    1. GitHub Personal Access Token 생성 페이지로 이동
    2. Generate new token 클릭 (GitHub API v3 권한 설정 필요)
    3. 필요한 권한 선택
      - repo → 비공개 레포지토리 검색 시 필요
      - read:org → 조직 내 레포지토리 검색 시 필요

### 2. 토큰 입력하기

    1. 발급한 Personal Access Token을 확장 프로그램에서 입력
    2. "토큰 저장" 버튼 클릭
