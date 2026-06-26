import { HomeIndicatorSpacer } from '../../src/components/common/HomeIndicatorSpacer'; // 공통 컴포넌트 경로
import { colors, radius, spacing, typography } from '@/src/constants';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

const KAKAO_ICON = require('../../assets/images/Icon/KaKao.png');
const APPLE_ICON = require('../../assets/images/Icon/Apple.png');

export default function LoginScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* 1. 상단 고정 바 (Figma 54px) */}
      <View style={[styles.statusBarSpacer, { height: Math.max(insets.top, 54) }]} />

      {/* 2. Content_Area (상하단 제외 순수 영역) */}
      <View style={styles.contentArea}>
        
        {/* Top_Area (Figma 스펙: 246.67px 강제 보장) */}
        <View style={styles.topArea}>
          <Text style={styles.title}>하루한개</Text>
          <Text style={styles.subtitle}>하루에 딱 하나만 해도 괜찮아요</Text>
        </View>

        {/* Middle_Area (Figma 스펙: 246.67px 강제 보장) */}
        <View style={styles.middleArea}>
          <View style={styles.logo} />
        </View>

        {/* Bottom_Area (Figma 스펙: 246.67px 강제 보장) */}
        <View style={styles.bottomArea}>
          <View style={styles.bottomContentGroup}>
            {/* 툴팁 */}
            <View style={styles.tooltipContainer}>
              <View style={styles.tooltipBubble}>
                <Text style={styles.tooltipText}>가장 편한 방법으로 시작해보세요!</Text>
              </View>
              <View style={styles.tooltipArrowRow}>
                <View style={styles.tooltipArrowShape} />
              </View>
            </View>

            {/* 버튼 그룹 */}
            <TouchableOpacity style={styles.btnKakao} activeOpacity={0.8}>
              <Image source={KAKAO_ICON} style={styles.btnIcon} />
              <Text style={styles.btnKakaoText}>카카오로 시작하기</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnApple} activeOpacity={0.8}>
              <Image source={APPLE_ICON} style={styles.btnIcon} />
              <Text style={styles.btnAppleText}>Apple로 시작하기</Text>
            </TouchableOpacity>

            {/* 게스트 버튼 */}
            {/* TODO: 임시 라우팅 - 확인 후 onPress 제거 */}
            <TouchableOpacity style={styles.guestButton} activeOpacity={0.7} onPress={() => router.push('/(auth)/terms')}>
              <Text style={styles.guestText}>게스트로 시작하기</Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>

      {/* 3. 🧪 하단 고정 인디케이터 (빨간색 테스트 배경) */}
      <View style={styles.indicatorRedWrapper}>
        <HomeIndicatorSpacer />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.default,
  },
  statusBarSpacer: {
    width: '100%',
  },
  contentArea: {
    flex: 1, 
  },

  // ── 👥 피그마 실측 수치(246.67px) 및 Center 정렬 완전 박제 ──
  topArea: {
    flex: 1,
    minHeight: 246.67,    // ⭕️ 피그마 실측값 강제 보장 (내용물에 의해 압착되는 것 방지)
    alignItems: 'center',
    justifyContent: 'center', // 정중앙 맞음 규칙 준수
    paddingTop: 80,      
    paddingBottom: 20,
    paddingLeft: 20,
    paddingRight: 20,
    gap: spacing.sm,
  },
  title: {
    ...typography.h1Display,
    color: colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.c1Caption,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  
  middleArea: {
    flex: 1,
    minHeight: 246.67,    // ⭕️ 피그마 실측값 강제 보장
    alignItems: 'center',
    justifyContent: 'center', // 정중앙 맞음 규칙 준수
  },
  logo: {
    width: 200,
    height: 200,
    backgroundColor: '#D9D9D9',
    borderRadius: radius.button,
  },

  bottomArea: {
    flex: 1,
    minHeight: 246.67,    // ⭕️ 피그마 실측값 강제 보장
    alignItems: 'center',
    justifyContent: 'center', // 정중앙 맞음 규칙 준수
  },

  bottomContentGroup: {
    width: '100%',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 20,
    gap: spacing.md,      
  },

  tooltipContainer: {
    alignSelf: 'center',
    marginBottom: 4,      
  },
  tooltipBubble: {
    backgroundColor: colors.surface.default,
    borderRadius: radius.pill,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 7,
    elevation: 4,
  },
  tooltipText: {
    ...typography.c1Caption,
    color: colors.text.secondary,
  },
  tooltipArrowRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  tooltipArrowShape: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.surface.default,
  },

  // 버튼 스타일
  btnKakao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 52,
    backgroundColor: '#FEE500',
    borderRadius: 12,
  },
  btnApple: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 52,
    backgroundColor: '#000000',
    borderRadius: 12,
  },
  btnIcon: {
    position: 'absolute',
    left: spacing.xl,
    width: 24,
    height: 24,
  },
  btnKakaoText: {
    ...typography.b2BodyMedium,
    color: '#191919',
    flex: 1,
    textAlign: 'center',
  },
  btnAppleText: {
    ...typography.b2BodyMedium,
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  guestButton: {
    padding: 8,
  },
  guestText: {
    ...typography.b4BodySm,
    color: colors.text.tertiary,
    textDecorationLine: 'underline',
  },

  indicatorRedWrapper: {
    width: '100%',
    backgroundColor: 'rgba(255, 0, 0, 0.2)', 
  },
});