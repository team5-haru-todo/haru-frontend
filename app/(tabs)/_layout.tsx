import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import React from 'react';
import { Animated, Image, Platform, StyleSheet, Text, View } from 'react-native';
import { CopilotProvider } from 'react-native-copilot';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HapticTab } from '@/components/haptic-tab';
import { HaruCopilotTooltipAdapter } from '@/src/components/tutorial/HaruCopilotTooltipAdapter';
import {
  TARGET_FRAME_INSET,
  TARGET_FRAME_RADIUS,
  TutorialTargetFrame,
} from '@/src/components/tutorial/TutorialTargetFrame';
import { mainTutorialStepConfigs } from '@/src/components/main/tutorial/mainTutorialConfigs';
import { useTutorialStore } from '@/src/store/tutorialStore';
import { colors } from '@/src/constants/colors';
import { layout } from '@/src/constants/layout';

// stepNumberComponent는 optional(React.ComponentType<any>)이라 생략도 가능하지만,
// 생략 시 라이브러리 기본 번호뱃지 UI가 노출되므로 명시적으로 숨긴다.
function HiddenStepNumber() {
  return null;
}

// react-native-copilot의 defaultSvgPath(dist/index.js 확인)는 직각 모서리 사각형만 그린다.
// 피그마의 둥근 흰색 frame에 맞춰 spotlight 모서리도 살짝 둥글게 하는 최소 커스텀 path.
// Animated.Value의 현재 숫자는 공개 API로 노출되지 않지만, 라이브러리 자신의 defaultSvgPath도
// 동일하게 내부 필드 `_value`를 읽는 방식으로 구현돼 있어 같은 방식을 그대로 따른다.
function readAnimatedValue(value: Animated.Value): number {
  return (value as unknown as { _value: number })._value;
}

// spotlight hole은 TutorialTargetFrame이 그리는 흰색 frame과 정확히 같은 사각형이어야 한다
// (같은 inset만큼 확장, 같은 radius) — 두 상수를 TutorialTargetFrame.tsx에서 그대로 가져와
// 값이 어긋나지 않게 한다.
function roundedSpotlightPath({
  size,
  position,
  canvasSize,
}: {
  size: Animated.ValueXY;
  position: Animated.ValueXY;
  canvasSize: { x: number; y: number };
}) {
  const measuredX = readAnimatedValue(position.x);
  const measuredY = readAnimatedValue(position.y);
  const measuredW = readAnimatedValue(size.x);
  const measuredH = readAnimatedValue(size.y);
  const x = measuredX - TARGET_FRAME_INSET;
  const y = measuredY - TARGET_FRAME_INSET;
  const w = measuredW + TARGET_FRAME_INSET * 2;
  const h = measuredH + TARGET_FRAME_INSET * 2;
  const r = Math.max(0, Math.min(TARGET_FRAME_RADIUS, w / 2, h / 2));
  const hole =
    `M${x + r},${y} H${x + w - r} A${r},${r} 0 0 1 ${x + w},${y + r} ` +
    `V${y + h - r} A${r},${r} 0 0 1 ${x + w - r},${y + h} ` +
    `H${x + r} A${r},${r} 0 0 1 ${x},${y + h - r} ` +
    `V${y + r} A${r},${r} 0 0 1 ${x + r},${y} Z`;
  return `M0,0H${canvasSize.x}V${canvasSize.y}H0V0Z${hole}`;
}

// 메모 탭 전용 tabBarButton — 공용 HapticTab을 그대로 감싸 재사용하고(햅틱/기존 동작 유지),
// [버그 수정] measure 대상을 props.children(React Navigation이 내부적으로 구성한 tabBarIcon+
// label 트리)에 그대로 맡기지 않는다. 그 트리는 tabBarItemStyle(width:56,height:56,
// justifyContent:'flex-start')에 종속된 자체 flex 레이아웃을 갖고 있어, TutorialTargetFrame이
// 기대하는 "콘텐츠 크기에 padding만 더해 자연스럽게 hug"가 되지 않고 부모 아이템 박스 크기
// 그대로 측정되는 문제가 있었다. 대신 아이콘+라벨을 이 함수가 직접, 명시적으로 렌더한다
// (props.children은 버리고 focused 여부만 accessibilityState에서 가져온다).
function TutorialMemoTabButton(props: BottomTabBarButtonProps) {
  const activeTourId = useTutorialStore((s) => s.activeTourId);
  const isTourActive = activeTourId === 'main-empty';
  const memoTabStepCfg = mainTutorialStepConfigs['main-empty-memo-tab'];
  const focused = props.accessibilityState?.selected ?? false;

  return (
    <HapticTab
      {...props}
      onPress={(event) => {
        // Step 2 진행 중에는 실제 메모장 이동을 차단한다. 튜토리얼이 끝나면(비활성) 기존대로 동작.
        if (isTourActive) return;
        props.onPress?.(event);
      }}
    >
      <TutorialTargetFrame stepConfig={memoTabStepCfg} active={isTourActive}>
        <View style={memoTabStyles.content}>
          <Image
            source={ICON_MEMO}
            style={{
              width: 24,
              height: 24,
              resizeMode: 'contain',
              tintColor: focused ? colors.primary.default : colors.text.tertiary,
            }}
          />
          <Text
            style={[
              memoTabStyles.label,
              { color: focused ? colors.primary.default : colors.text.tertiary },
            ]}
          >
            메모장
          </Text>
        </View>
      </TutorialTargetFrame>
    </HapticTab>
  );
}

const memoTabStyles = StyleSheet.create({
  // [설계 변경] 이전에는 프레임 padding으로 아이콘+라벨 크기에 맞춰 자연스럽게 hug했다.
  // 이제 흰 frame/spotlight는 TutorialTargetFrame이 고정 inset(TARGET_FRAME_INSET)으로
  // 그리므로, 여기 content 자체를 명시적 고정 크기(52×48)로 둬 기기/폰트스케일과 무관하게
  // 항상 같은 target 크기가 measure되게 한다(흰 frame 결과 약 68×64).
  // height는 44 → 48로: 24(아이콘) + 3(marginTop) + 14(라벨 lineHeight) = 41이 44 안에서는
  // 여유가 거의 없어(2px) 실기기 폰트 렌더링에 따라 라벨이 박스 밖으로 살짝 넘칠 수 있었다.
  content: {
    width: 52,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 기존 tabBarLabelStyle(screenOptions)과 동일한 타이포를 그대로 재사용한다.
  label: {
    fontSize: 11,
    fontFamily: 'Pretendard-Regular',
    lineHeight: 14,
    marginTop: 3,
  },
});

const ICON_HOME_ACTIVE = require('../../assets/images/Icon/Tab_Home_Active.png');
const ICON_HOME_INACTIVE = require('../../assets/images/Icon/Tab_Home_Inactive.png');
const ICON_MEMO = require('../../assets/images/Todolist_ic.png');
const ICON_CALENDAR_ACTIVE = require('../../assets/images/Icon/Tab_Calendar_Active.png');
const ICON_CALENDAR_INACTIVE = require('../../assets/images/Icon/Tab_Calendar_Inactive.png');
const ICON_MYPAGE_ACTIVE = require('../../assets/images/Icon/Tab_Mypage_Active.png');
const ICON_MYPAGE_INACTIVE = require('../../assets/images/Icon/Tab_Mypage_Inactive.png');

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  // iOS는 기존 디자인 그대로 유지한다. Android는 기기별 시스템 네비게이션 바 높이(insets.bottom)를
  // 반영해, 고정 25px보다 실제 시스템 바가 큰 기기에서 라벨이 가려지지 않게 한다.
  const basePaddingBottom = 25;
  const tabBarPaddingBottom =
    Platform.OS === 'android' ? Math.max(insets.bottom, basePaddingBottom) : basePaddingBottom;
  // paddingBottom이 늘어난 만큼 height도 같이 늘려, 아이콘/라벨이 들어갈 상단 영역이 눌리지 않게 한다.
  const tabBarHeight = layout.tabBarHeight + Math.max(tabBarPaddingBottom - basePaddingBottom, 0);

  return (
    // CopilotProvider가 <Tabs> 전체(탭바 포함)를 감싸야 메모 탭 target이 메인 화면의
    // 나머지 3개 target과 같은 tour 컨텍스트에 등록된다.
    // overlay="svg": react-native-svg가 포함된 development build 재설치 완료 — 단일 spotlight mask로 렌더한다.
    <CopilotProvider
      overlay="svg"
      backdropColor="rgba(21, 23, 28, 0.65)"
      tooltipComponent={HaruCopilotTooltipAdapter}
      stepNumberComponent={HiddenStepNumber}
      // [버그 수정] dist 확인: androidStatusBarVisible 기본값은 false이고, 그 상태에서
      // Android는 spotlight/기본 arrow 위치 계산 직전에 `rect.y -= StatusBar.currentHeight`를
      // 적용한다(_animateMove, dist/index.js). 이 보정은 라이브러리 내부 SVG spotlight에만
      // 적용되고 우리가 직접 호출하는 currentStep.measure()에는 적용되지 않으므로, Android에서
      // spotlight 구멍이 실제 control(그리고 우리 흰 frame·tooltip·화살표)보다 상태바 높이만큼
      // 위로 떠 보이는 원인이었다("frame이 실제 target보다 위에 있다"). true로 주면 이 보정을
      // 건너뛰어 spotlight도 raw measure() 좌표를 그대로 쓰게 되어 우리 계산과 일치한다.
      androidStatusBarVisible
      // [설계 변경] 라이브러리 기본 화살표(Tooltip과 별개로 렌더되는 Animated.View, dist
      // 확인: `!!arrowSize && <Animated.View style={[styles.arrow, arrowStyles]} />`)를
      // arrowSize={0}으로 완전히 제거한다 — arrowSize가 falsy면 그 엘리먼트 자체가 아예
      // 생성되지 않으므로 arrowColor 등으로 투명화하는 것보다 확실하다. 꼭지는 이제
      // TutorialTooltipShell이 target 중앙을 향해 직접 그린다(placement.arrowLeft/Side).
      arrowSize={0}
      // [버그 수정] step 전환/종료 애니메이션을 끄고 즉시 새 위치로 점프시킨다.
      // animated:true(기본값) 상태에서 애니메이션 중간에 언마운트/재마운트가 겹치면
      // 이전 tooltip·spotlight가 화면에 남아 보이는 잔상 증상이 있었다.
      animated={false}
      // [설계 변경] 이전에는 기본 tooltip wrapper를 투명화만 하고 position(left/right/top/
      // bottom/maxWidth)은 라이브러리의 동적 계산(dist의 tooltipStyles state)에 맡겼다.
      // 그 계산은 target x좌표만으로 좌/우 앵커를 정해 카드가 화면 중앙이 아니라 target
      // 옆으로 붙는 구조라 "네 단계 모두 동일 크기 카드가 항상 화면 가로 중앙" 요구와
      // 근본적으로 맞지 않는다. 이제 이 wrapper는 화면 전체를 덮는 순수 좌표계 host로만
      // 쓰고, 카드의 실제 화면 위치는 TutorialTooltipShell이 이 host 안에서 자신의
      // position:absolute(left/top/width/height)로 직접 지정한다.
      //
      // 병합 순서(dist 확인): style=[styles.tooltip, tooltipStyles(동적), tooltipStyle(여기)].
      // tooltipStyle이 배열의 마지막이라 같은 key는 항상 이 값이 이긴다. top/left는 0으로
      // 확정하고, 동적 계산이 채울 수 있는 right/bottom/maxWidth는 여기서 명시적으로
      // undefined를 줘서 무효화해야 한다(생략하면 동적값이 그대로 남아 host가 찌그러진다).
      tooltipStyle={{
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        maxWidth: undefined,
        margin: 0,
        padding: 0,
        paddingTop: 0,
        paddingHorizontal: 0,
        backgroundColor: 'transparent',
        borderRadius: 0,
        overflow: 'visible',
      }}
      // margin은 더 이상 tooltip 위치 계산에 관여하지 않는다(위 tooltipStyle이 라이브러리의
      // 동적 top/left/right/bottom/maxWidth를 전부 덮어쓰기 때문). target↔tooltip 간격은
      // HaruCopilotTooltipAdapter의 자체 계산(TARGET_FRAME_INSET+TARGET_ARROW_VISUAL_GAP+
      // ARROW_HEIGHT)이 대신 담당한다.
      // 개발 중 overlay에 갇히지 않도록 dim 영역 터치로 탈출 가능하게 하는 안전장치 —
      // __DEV__에서만 켜고, 프로덕션에서는 의도치 않은 조기 종료를 막기 위해 비활성화한다.
      stopOnOutsideClick={__DEV__}
      // 피그마: spotlight 모서리를 살짝 둥글게(기본 defaultSvgPath는 직각). 흰 frame과 같은
      // inset/radius(TARGET_FRAME_INSET/RADIUS)를 써서 항상 정확히 겹치게 한다.
      svgMaskPath={roundedSpotlightPath}
    >
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary.default,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: colors.button.disabled,
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingTop: 7,
          paddingBottom: tabBarPaddingBottom,
          paddingHorizontal: 24,
          position: 'absolute',
        },
        tabBarItemStyle: {
          width: 56,
          height: 56,
          justifyContent: 'flex-start',
          paddingTop: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'Pretendard-Regular',
          lineHeight: 14,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ focused }) => (
            <Image
              source={focused ? ICON_HOME_ACTIVE : ICON_HOME_INACTIVE}
              style={{ width: 24, height: 24, resizeMode: 'contain' }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="memo"
        options={{
          title: '메모장',
          // [수정] target을 tabBarIcon(아이콘만)이 아니라 tabBarButton으로 옮겼다 — 피그마가
          // 요구하는 강조 범위는 "아이콘+라벨"이고, tabBarIcon 반환값은 라벨을 포함하지 않는다.
          tabBarButton: TutorialMemoTabButton,
          tabBarIcon: ({ focused }) => (
            <Image
              source={ICON_MEMO}
              style={{
                width: 24,
                height: 24,
                resizeMode: 'contain',
                tintColor: focused ? colors.primary.default : colors.text.tertiary,
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: '캘린더',
          tabBarIcon: ({ focused }) => (
            <Image
              source={focused ? ICON_CALENDAR_ACTIVE : ICON_CALENDAR_INACTIVE}
              style={{ width: 24, height: 24, resizeMode: 'contain' }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="mypage"
        options={{
          title: '마이페이지',
          tabBarIcon: ({ focused }) => (
            <Image
              source={focused ? ICON_MYPAGE_ACTIVE : ICON_MYPAGE_INACTIVE}
              style={{ width: 24, height: 24, resizeMode: 'contain' }}
            />
          ),
        }}
      />
    </Tabs>
    </CopilotProvider>
  );
}
