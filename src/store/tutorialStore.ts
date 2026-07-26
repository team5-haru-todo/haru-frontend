import { create } from 'zustand';
import type { TutorialTourId } from '@/src/components/tutorial/tutorialTypes';

export type { TutorialTourId };

// tour가 끝났을 때 "이 튜토리얼을 봤다고 서버에 저장해야 하는지"를 화면(index.tsx)에
// 알리는 일회성 이벤트. 서버 영구 저장값이 아니다 — index.tsx가 이 이벤트를 감지해
// PATCH를 보낸 뒤 clearCompletion()으로 소비한다. nonce는 같은 tourId로 연달아 완료해도
// (예: 같은 세션에서 재시작 후 재완료) 이전 값과 참조/얕은비교가 우연히 같아져 effect가
// 누락되는 일이 없게 매번 증가시킨다.
export type TutorialCompletionEvent = {
  tourId: TutorialTourId;
  nonce: number;
};

type TutorialStore = {
  activeTourId: TutorialTourId | null;
  isRunning: boolean;
  completionEvent: TutorialCompletionEvent | null;
  setActiveTourId: (tourId: TutorialTourId | null) => void;
  setRunning: (running: boolean) => void;
  emitCompletion: (tourId: TutorialTourId) => void;
  clearCompletion: () => void;
  reset: () => void;
};

// react-native-copilot이 담당하는 targetRect/currentStepIndex/spotlight 좌표/현재 step/
// goToNext/overlay 상태는 여기 두지 않는다. 이 store는 "지금 어떤 tour가 활성인지",
// "실제로 start()가 성공해 실행 중인지", "방금 어떤 tour가 끝나 서버에 저장해야 하는지"만
// 여러 화면(탭바 target 포함)에 공유한다. API 콜백이나 React 컴포넌트 콜백 자체를 store에
// 저장하지 않는다 — completionEvent는 순수 데이터이고, 실제 PATCH 호출은 index.tsx가 한다.
//
// 상태 해석(3단계, activeTourId/isRunning 조합):
//   idle     : activeTourId === null && isRunning === false
//   starting : activeTourId !== null && isRunning === false  (step active화 완료, start() 대기/호출 중)
//   running  : activeTourId !== null && isRunning === true   (start() 성공 확인 후)
export const useTutorialStore = create<TutorialStore>((set) => ({
  activeTourId: null,
  isRunning: false,
  completionEvent: null,
  setActiveTourId: (tourId) => set({ activeTourId: tourId }),
  setRunning: (running) => set({ isRunning: running }),
  emitCompletion: (tourId) =>
    set((state) => ({ completionEvent: { tourId, nonce: state.completionEvent ? state.completionEvent.nonce + 1 : 1 } })),
  clearCompletion: () => set({ completionEvent: null }),
  // 로그아웃/회원탈퇴 등 계정 세션이 끝나는 지점에서 호출한다 — 다음 계정에 이전 계정의
  // 활성 tour나 미처리 completionEvent가 새어 들어가지 않게 한다.
  reset: () => set({ activeTourId: null, isRunning: false, completionEvent: null }),
}));
