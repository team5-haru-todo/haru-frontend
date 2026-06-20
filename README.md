# 하루한개 (Haru) - 프론트엔드

> 하루에 딱 하나만 해도 괜찮아요

하루한개(Haru) 앱의 프론트엔드 레포입니다. React Native + Expo로 개발하고 있습니다.

## 기술 스택

- React Native
- Expo (SDK 56)
- TypeScript

## 시작하기

### 1. 패키지 설치

```bash
npm install
```

### 2. 앱 실행

```bash
npx expo start
```

실행하면 터미널에 QR코드가 나타납니다. 핸드폰에 **Expo Go** 앱을 설치한 후 QR코드를 스캔하면 바로 확인할 수 있습니다.

- iOS: [App Store에서 Expo Go 다운로드](https://apps.apple.com/app/expo-go/id982107779)
- Android: [Play Store에서 Expo Go 다운로드](https://play.google.com/store/apps/details?id=host.exp.exponent)

## 브랜치 구조

```
main
└── develop
    ├── feature/auth       (사용자·인증·설정)
    ├── feature/memo       (메모장)
    ├── feature/main       (메인·완료·스트릭)
    └── feature/calendar   (캘린더·리포트·알림)
```

## 작업 방식

1. 각자 본인 담당 `feature` 브랜치에서 작업합니다.
2. 작업이 끝나면 `develop` 브랜치로 Pull Request를 생성합니다.
3. `develop`에서 통합 테스트를 마친 후 `main`으로 머지합니다.

## 담당자 및 도메인

| 담당자 | 브랜치 | 도메인 | 작업 화면 |
|---|---|---|---|
| 김다은 | `feature/auth` | 사용자·인증·설정 | 로그인, 마이페이지, 설정 |
| 조아영 | `feature/memo` | 메모장 | 할 일 목록, 추가/수정/삭제, 북마크 |
| 최희원 | `feature/main` | 메인·완료·스트릭 | 메인, 오늘의 한 개, 완료, 불꽃 |
| 정윤서 | `feature/calendar` | 캘린더·리포트·알림 | 캘린더, 날짜 상세, 리포트, 알림 |

## 작업 시작 방법

```bash
git clone https://github.com/team5-haru-todo/haru-frontend.git
cd haru-frontend
git checkout feature/본인담당브랜치
npm install
npx expo start
```

## 프로젝트 구조

이 프로젝트는 파일 기반 라우팅(file-based routing)을 사용합니다. `src/app` 디렉토리 안의 파일을 수정하면서 개발을 시작할 수 있습니다.

## 일정

- 개발 시작: 2026.6.20
- 1차 개발 완료 및 베타테스트: 2026.6.27
- 최종 배포: 2026.7.13

## 참고 자료

- [Expo 공식 문서](https://docs.expo.dev/)
- [Expo Router (파일 기반 라우팅)](https://docs.expo.dev/router/introduction/)
- [TypeScript 가이드](https://docs.expo.dev/guides/typescript/)