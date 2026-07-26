import { colors } from '@/src/constants/colors';
import { spacing } from '@/src/constants/layout';
import { typography } from '@/src/constants/typography';
import { Fragment } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { TutorialTooltipShellProps } from './tutorialTypes';

// 피그마 기준 순수 말풍선 UI. 위치는 이제 react-native-copilot이 아니라 호출부
// (HaruCopilotTooltipAdapter)가 계산해 placement로 내려주고, 이 컴포넌트는
// position:absolute로 그 좌표에 스스로를 배치한다(카드 크기는 네 단계 모두 고정).
// react-native-copilot이나 zustand는 import하지 않는다(context/라이브러리 비의존).
//
// [설계 변경] 이전에는 target 위치에 따라 카드 폭이 매번 달라졌다(라이브러리의 자동 좌우
// 배치에 맞춘 anchor-aware 가변폭). 피그마 요구는 "네 단계 모두 동일한 크기의 말풍선이
// 항상 화면 가로 중앙에 있고, 꼭지만 target 중앙을 향해 좌우로 움직인다"이므로, 카드
// 자체는 고정 크기/고정 좌표로 렌더하고 꼭지 삼각형만 placement.arrowLeft로 이동한다.
// react-native-copilot 기본 arrow는 Provider의 arrowSize={0}으로 완전히 숨기고
// (node_modules/react-native-copilot/dist/index.js 확인: `!!arrowSize && ...` 조건이라
// 0이면 아예 렌더되지 않음), 꼭지는 이 컴포넌트가 직접 그린다.
export function TutorialTooltipShell({
  titleParts,
  description,
  progress,
  secondaryAction,
  primaryAction,
  placement,
}: TutorialTooltipShellProps) {
  return (
    <View
      style={[
        styles.card,
        {
          left: placement.screenLeft,
          top: placement.screenTop,
          width: placement.width,
          height: placement.height,
        },
      ]}
    >
      <View
        style={[
          styles.arrowBase,
          placement.arrowSide === 'top' ? styles.arrowTop : styles.arrowBottom,
          { left: placement.arrowLeft },
        ]}
      />

      <Text style={styles.title} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.84}>
        {titleParts.map((part, index) => (
          <Fragment key={index}>
            {part.highlighted ? (
              <Text style={styles.titleHighlight}>{part.text}</Text>
            ) : (
              part.text
            )}
          </Fragment>
        ))}
      </Text>
      {description ? (
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
      ) : null}

      {/* 피그마 순서: 건너뛰기(왼쪽) — 1/3 + 다음(오른쪽 그룹). secondaryAction이 없으면
          (completed) 오른쪽 그룹만 flex-end로 배치해 진행표시/건너뛰기 자리를 남기지 않는다.
          footer는 카드 고정 height 안에서 항상 같은 위치(absolute, bottom:16)에 있어,
          제목/설명 줄 수가 늘어나도 footer 위치는 흔들리지 않는다. */}
      <View style={[styles.footer, !secondaryAction && styles.footerSingle]}>
        {secondaryAction ? (
          <TouchableOpacity
            onPress={secondaryAction.onPress}
            disabled={secondaryAction.disabled}
            style={styles.secondaryButton}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryLabel}>{secondaryAction.label}</Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.footerRight}>
          {progress ? (
            <Text style={styles.progress}>
              {progress.current}/{progress.total}
            </Text>
          ) : null}
          <TouchableOpacity
            onPress={primaryAction.onPress}
            disabled={primaryAction.disabled}
            style={styles.primaryButton}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryLabel}>{primaryAction.label}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    backgroundColor: colors.surface.default,
    // 피그마 지정 cornerRadius 20 — 기존 radius 토큰(16/24/999)과 다른 신규 값이라 리터럴 사용.
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    gap: spacing.sm,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
    // width/height/left/top은 placement로 매 렌더 주입 — 네 단계 모두 width/height는 동일.
  },
  arrowBase: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  // target이 카드 아래쪽에 있을 때(Step1): 꼭지가 카드 상단에 붙어 위를 가리킨다.
  arrowTop: {
    top: -10,
    borderBottomWidth: 10,
    borderBottomColor: colors.surface.default,
  },
  // target이 카드 위쪽에 있을 때(Step2/3/Completed): 꼭지가 카드 하단에 붙어 아래를 가리킨다.
  arrowBottom: {
    bottom: -10,
    borderTopWidth: 10,
    borderTopColor: colors.surface.default,
  },
  // 카드 height가 136으로 줄어 typography 토큰(b1Subtitle) 대신 피그마 지정 리터럴 사용.
  title: {
    fontSize: 17,
    lineHeight: 22,
    fontFamily: 'Pretendard-SemiBold',
    color: colors.text.primary,
  },
  titleHighlight: {
    color: colors.primary.default,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.text.secondary,
    marginTop: 6,
  },
  // footer는 카드 고정 height 안에서 항상 같은 자리(absolute) — 텍스트 줄 수와 무관하다.
  footer: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 14,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerSingle: {
    justifyContent: 'flex-end',
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
  },
  progress: {
    ...typography.b4BodySm,
    color: colors.primary.default,
  },
  secondaryButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  secondaryLabel: {
    ...typography.b4BodySm,
    color: colors.text.placeholder,
  },
  // 피그마: 지나치게 큰 pill이 아니라 작은 rounded rectangle. flex/전체폭 금지, 내용 크기로 hug.
  primaryButton: {
    minHeight: 36,
    borderRadius: 9,
    backgroundColor: colors.primary.default,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  primaryLabel: {
    ...typography.b4BodySm,
    color: colors.surface.default,
  },
});
