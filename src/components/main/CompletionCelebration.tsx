import { colors } from "@/src/constants/colors";
import { spacing } from "@/src/constants/layout";
import { typography } from "@/src/constants/typography";
import LottieView from "lottie-react-native";
import { useEffect, useRef } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { StreakBadge } from "./StreakBadge";
import { WeeklyStrip } from "./WeeklyStrip";

type Props = {
  taskContent: string;
  streakCount: number;
  todayDayIndex: number;
  completedDays: boolean[];
  onShare: () => void;
  onConfirm: () => void;
};

export function CompletionCelebration({
  streakCount,
  todayDayIndex,
  completedDays,
  onShare,
  onConfirm,
}: Props) {
  const confettiRef = useRef<LottieView>(null);

  useEffect(() => {
    // check.json은 autoPlay로 즉시 재생
    // confetti.json은 check 시작 후 430ms 딜레이 후 재생
    const timer = setTimeout(() => {
      confettiRef.current?.play();
    }, 430);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.screen}>
      <View style={styles.contentArea}>
        {/* Confetti_JSON: Content_Area 전체 오버레이, check 뒤에서 터짐 (zIndex 0) */}
        <LottieView
          ref={confettiRef}
          source={require("../../../assets/animations/confetti.json")}
          autoPlay={false}
          loop={false}
          style={styles.confettiLottie}
          webStyle={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: 313,
            zIndex: 0,
          }}
          resizeMode="cover"
        />

        <Text style={styles.title}>오늘 한 개 완료!</Text>

        <View style={styles.resultCard}>
          {/* Check_JSON: check.json 캔버스(1920x1920) 안에서 실제 체크 배지는 지름 약 693px짜리
              원이라 재생 박스를 그대로 124px로 두면 배지가 124*693/1920≈45px로 작게 나온다.
              레이아웃(박스가 차지하는 공간)은 기존 124x124 그대로 유지하고, transform: scale로
              그려지는 크기만 키워서 아래 형제 요소(StreakBadge 등) 위치는 그대로 둔다.
              배지가 ~100px로 보이도록 스케일 = 100 / (124 * 693/1920) ≈ 2.234 */}
          <LottieView
            source={require("../../../assets/animations/check.json")}
            autoPlay={true}
            loop={false}
            style={styles.checkLottie}
            webStyle={{ width: 124, height: 124, transform: "scale(2.234)" }}
          />

          <StreakBadge count={streakCount} />
        </View>
      </View>

      <View style={styles.weekStripSection}>
        <WeeklyStrip
          todayDayIndex={todayDayIndex}
          completedDays={completedDays}
          variant="celebration"
        />
      </View>

      {/* TODO: 카카오톡 공유 SDK 연동 후 onShare 실제 구현 */}
      <TouchableOpacity
        style={styles.shareButton}
        onPress={onShare}
        activeOpacity={0.8}
      >
        <Image
          source={require("../../../assets/images/share.png")}
          style={styles.shareIcon}
          resizeMode="contain"
        />
        <Text style={styles.shareText}>공유하기</Text>
      </TouchableOpacity>

      {/* 고정 spacer(Figma 134px) 대신 flex:1로 확인 버튼을 화면 하단에 고정하는 의도만 재현 */}
      <View style={styles.bottomSpacer} />

      <View style={styles.confirmWrapper}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={onConfirm}
          activeOpacity={0.8}
        >
          <Text style={styles.confirmText}>확인</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width: "100%",
  },
  contentArea: {
    alignItems: "center",
    gap: 30,
    paddingHorizontal: spacing.xl,
  },
  confettiLottie: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 313,
    zIndex: 0,
    pointerEvents: "none",
  },
  title: {
    ...typography.h1Display,
    color: colors.primary.default,
    textAlign: "center",
    zIndex: 1,
  },
  resultCard: {
    alignItems: "center",
    justifyContent: "center",
    gap: 34,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxxl + spacing.sm,
    width: "100%",
  },
  checkLottie: {
    width: 124,
    height: 124,
    zIndex: 1,
    transform: [{ scale: 2.234 }],
  },
  weekStripSection: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    width: "100%",
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignSelf: "center",
    marginTop: 20,
  },
  shareIcon: {
    width: 20,
    height: 20,
    tintColor: colors.primary.default,
  },
  shareText: {
    ...typography.b2BodyMedium,
    color: colors.primary.default,
  },
  bottomSpacer: {
    flex: 1,
  },
  confirmWrapper: {
    width: "100%",
    paddingHorizontal: spacing.xl,
  },
  confirmButton: {
    backgroundColor: colors.primary.default,
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  confirmText: {
    ...typography.b2BodyBold,
    color: colors.surface.default,
  },
});
