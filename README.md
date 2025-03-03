# 🔎 GitHub Commit & Comment Search

GitHub에서 특정 키워드가 포함된 **커밋 메시지 & 커밋 코멘트**를 빠르게 검색할 수 있는 Chrome 확장 프로그램입니다.   

이슈 관리가 잘된 프로젝트인 경우, 관련 내용을 Issues 탭에서 검색할 수 있지만, 그렇지 않은 경우에는 커밋 히스토리를 하나씩 확인해야 합니다.
이 확장 프로그램을 사용하면 간단한 **팝업창**에서 특정 키워드가 포함된 커밋 메시지와 코멘트를 손쉽게 검색하여, 코드 변경 흐름을 더 효과적으로 파악할 수 있습니다.

어떤 기능과 관련된 코드를 찾고 싶은데, **언제 구현**되었는지 정확한 커밋 시점을 모르거나 **커밋 기록이 너무 많아** 페이지를 넘겨가며 찾기 어려울 때 유용합니다.
또한, feat, design과 같은 **커밋 컨벤션**으로 검색하면 프로젝트의 **기능이나 디자인이 추가된 흐름**을 **한눈에 파악**할 수 있습니다.
  
## ✨ 제공 기능

✔️ 찾고자하는 GitHub 커밋 메시지 및 커밋 코멘트 검색 시 링크 제공  
✔️ **자신의 비공개 레포지토리도 검색 가능 (GitHub Personal Access Token 필요)**  
✔️ 검색 결과를 클릭하면 해당 링크로 바로 이동  
➕ OAuth2를 활용하여 직접 토큰을 입력하지 않고 검색하도록 프로젝트 확장 가능  

## 🔥실행 화면 
### 1. 검색하기
<table>
  <tr>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/bb2ca418-4395-480f-80d8-d1a14a3dd5d5" width="500"><br>
      <b>1-1. 커밋 컨벤션 'feat'으로 검색</b>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/a390a9ea-1cd9-4147-9f8d-4d9af0877118" width="500"><br>
      <b>1-2. 특정 단어 '동기화'로 검색</b>
    </td>
  </tr>
</table>  

### 2. 검색 레포지토리 변경하기  
<table>
  <tr>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/f4f76019-9fc4-455b-a391-7589988a7b82" width="500"><br>
      <b>2-1. 레포지토리 이동 후, 상단의 리프레쉬 버튼 클릭</b>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/559910bc-8c66-4100-89dc-5b1ef5b94d40" width="500"><br>
      <b>2-2. 현재 레포지토리로 변경 완료</b>
    </td>
  </tr>
</table>

### 3. 링크 이동하기  
<table>
  <tr>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/7042f58b-81d6-4a73-a5af-196161e0365e" width="500"><br>
      <b>3-1. 확인하고 싶은 링크 클릭</b>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/f9c6686c-8256-43b7-a0bc-7fe7fbdb2d44" width="500"><br>
      <b>3-2. 커밋, 코멘트 내용 확인</b>
    </td>
  </tr>
</table>   

&nbsp;

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
