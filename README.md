# 하루한개 (Haru)

완벽하지 않아도 괜찮아요, 오늘의 '한 개'만 해내는 습관 기록 앱

> 5조 파이널 프로젝트 (부트캠프 팀 프로젝트)
> 개발 기간 : 2026.06.20 ~ [정식 출시일]

## 🚀 배포 주소

프론트엔드 서비스 : [App Store / TestFlight 링크]
백엔드 서버 : https://43.201.8.125.sslip.io

## 📝 팀 문서

- [팀 노션 링크]
- [백엔드 저장소](https://github.com/team5-haru-todo/haru-backend)

## 👥 팀 소개

| Pictures | | | | |
|---|---|---|---|---|
| Name | 김다은 | 조아영 | 최희원 | 정윤서 |
| Role | 팀장 · 인증/온보딩/설정 담당<br>• Refresh Token 인증 구조 설계<br>• 게스트 로그인 정책 설계 및 구현<br>• 회원 탈퇴/계정 관리<br>• 마이페이지, 이용약관 | 메모장 담당<br>• [조아영님 역할 채우기] | 메인·완료·스트릭 담당<br>• [최희원님 역할 채우기] | 캘린더·알림 담당<br>• [정윤서님 역할 채우기] |
| GitHub | [@kimdevlab1](https://github.com/kimdevlab1) | [@아영님 GitHub] | [@희원님 GitHub] | [@윤서님 GitHub] |

## ☁️ 프로젝트 소개

### 1. 프로젝트 컨셉

- 완벽한 하루가 아니어도, 오늘 딱 하나만 해내면 충분하다는 메시지를 담은 습관 기록 앱
- 로그인 없이도 핵심 기능을 모두 쓸 수 있는 게스트 모드 지원
- 카카오·Apple 로그인으로 기록을 안전하게 보관하고 여러 기기에서 이어서 사용 가능

### 2. 기술 스택

**프론트엔드**

![React Native](https://img.shields.io/badge/react_native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Zustand](https://img.shields.io/badge/zustand-433E38?style=for-the-badge)
![Axios](https://img.shields.io/badge/axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)

**백엔드**

![Spring Boot](https://img.shields.io/badge/spring_boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgresql-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

## ✨ 주요 기능

### 게스트 로그인

<img src="[스크린샷 경로]" width="240"/>

로그인 없이도 등록·완료·메모장·캘린더·알림 등 핵심 기능을 모두 사용할 수 있습니다. 첫 완료 후, 그리고 기록이 쌓였을 때 로그인을 부드럽게 안내하며, 로그인을 거절해도 게스트로 계속 이용할 수 있습니다.

### 오늘의 한 개 등록·완료

<img src="[스크린샷 경로]" width="240"/>

하루에 할 일을 딱 하나만 등록하고 완료하는 것에 집중한 메인 화면입니다. 완료 시 피드백과 연속 달성 기록을 보여줍니다.

### 계정 연결 (카카오 · Apple)

<img src="[스크린샷 경로]" width="240"/>

게스트로 쌓은 기록을 그대로 유지한 채, 카카오·Apple 계정을 연결해 여러 기기에서 이어서 사용할 수 있습니다. Refresh Token 기반 인증 구조로, 앱을 오래 켜두지 않아도 자동으로 로그인 상태가 유지됩니다.

### 메모장

<img src="[스크린샷 경로]" width="240"/>

### 캘린더

<img src="[스크린샷 경로]" width="240"/>

날짜별로 완료 기록을 한눈에 확인할 수 있습니다.

### 마이페이지 · 알림

<img src="[스크린샷 경로]" width="240"/>

계정 상태 확인, 알림 설정, 회원 탈퇴 등을 관리할 수 있습니다.
