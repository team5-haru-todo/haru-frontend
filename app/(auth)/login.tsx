import { colors, radius, spacing, typography } from '@/src/constants';
import { Animated, Easing, Image, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as AppleAuthentication from 'expo-apple-authentication';
import { login as kakaoLogin } from '@react-native-seoul/kakao-login';
import { LinearGradient } from 'expo-linear-gradient';
import {
  loginAsGuest,
  loginWithApple,
  loginWithKakao,
  checkKakaoUser,
  checkAppleUser,
} from '@/src/api/auth';
import { useUserStore } from '@/src/store/userStore';
import { HomeIndicatorSpacer } from '@/src/components/common/HomeIndicatorSpacer';
import { logEvent } from '@/src/lib/analytics';

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

const KAKAO_ICON = require('../../assets/images/Icon/KaKao.png');
const APPLE_ICON = require('../../assets/images/Icon/Apple.png');
const LOGO_ICON = require('../../assets/images/logo.png');

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const fetchUser = useUserStore((state) => state.fetchUser);

  // 배경 그라디언트 움직임용
  const gradientOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(gradientOpacity, {
          toValue: 1,
          duration: 6000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(gradientOpacity, {
          toValue: 0,
          duration: 6000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const handleGuestLogin = () => {
    if (loading) return;
    logEvent('login_method_selected', { method: 'guest' });
    // 게스트도 최초 진입 시 약관 동의가 필요 — 실제 가입 처리는 terms.tsx에서 완료된다.
    router.push({
      pathname: '/(auth)/terms',
      params: { provider: 'guest' },
    });
  };

  const handleKakaoLogin = async () => {
    if (loading) return;
    setLoading(true);
    logEvent('login_method_selected', { method: 'kakao' });
    try {
      // 1. 카카오 네이티브 SDK로 카카오 자체 로그인 (기기의 카카오톡 앱 또는 웹뷰)
      const kakaoToken = await kakaoLogin();

      // 2. 신규 유저인지 먼저 확인 (DB에 아직 아무것도 저장 안 됨)
      const { isNewUser } = await checkKakaoUser(kakaoToken.accessToken);

      if (isNewUser) {
        // 신규 유저 — 약관 동의 화면으로 이동, 실제 가입은 거기서 동의 완료 시 처리
        router.push({
          pathname: '/(auth)/terms',
          params: { provider: 'kakao', kakaoAccessToken: kakaoToken.accessToken },
        });
        return;
      }

      // 3. 기존 유저 — 바로 로그인 처리 (termsVersion은 최초 가입 때 이미 저장되어 있으므로 서버에서 무시됨)
      const { accessToken, user } = await loginWithKakao({
        accessToken: kakaoToken.accessToken,
        termsVersion: '',
        agreedAt: new Date().toISOString(),
      });

      if (Platform.OS !== 'web') {
        await SecureStore.setItemAsync('authToken', accessToken);
      }
      await fetchUser();
      router.replace(user.hasSeenOnboarding ? '/(tabs)' : '/(tutorial)');
    } catch (error) {
      console.error('카카오 로그인 실패:', error);
      // TODO: 에러 발생 시 사용자에게 보여줄 알림 UI 추가 필요
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    if (loading) return;
    setLoading(true);
    logEvent('login_method_selected', { method: 'apple' });
    try {
      // 1. Apple 네이티브 로그인 UI로 로그인, identityToken(JWT) 받기
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error('Apple identityToken을 받지 못했습니다.');
      }

      // 2. 신규 유저인지 먼저 확인
      const { isNewUser } = await checkAppleUser(credential.identityToken);

      if (isNewUser) {
        router.push({
          pathname: '/(auth)/terms',
          params: { provider: 'apple', appleIdentityToken: credential.identityToken },
        });
        return;
      }

      // 3. 기존 유저 — 바로 로그인 처리
      const { accessToken, user } = await loginWithApple({
        identityToken: credential.identityToken,
        termsVersion: '',
        agreedAt: new Date().toISOString(),
      });

      if (Platform.OS !== 'web') {
        await SecureStore.setItemAsync('authToken', accessToken);
      }
      await fetchUser();
      router.replace(user.hasSeenOnboarding ? '/(tabs)' : '/(tutorial)');
    } catch (error: any) {
      if (error?.code === 'ERR_REQUEST_CANCELED') {
        // 사용자가 직접 취소한 경우 - 에러 처리 불필요
      } else {
        console.error('Apple 로그인 실패:', error);
        // TODO: 에러 발생 시 사용자에게 보여줄 알림 UI 추가 필요
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 배경 그라디언트 레이어 1 (고정) */}
      <LinearGradient
        colors={['#FFFFFF', colors.primary.light]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* 배경 그라디언트 레이어 2 (opacity 애니메이션으로 교차) */}
      <AnimatedGradient
        colors={['#B8DFFF', '#FFFFFF']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[StyleSheet.absoluteFill, { opacity: gradientOpacity }]}
      />

      <StatusBar style="dark" />

      {/* 1. 상단 고정 바 (Figma 54px) */}
      <View style={[styles.statusBarSpacer, { height: Math.max(insets.top, 54) }]} />

      {/* 2. Content_Area (상하단 제외 순수 영역) */}
      <View style={styles.contentArea}>

        {/* Top_Area */}
        <View style={styles.topArea}>
          <Text style={styles.title}>하루한개</Text>
          <Text style={styles.subtitle}>하루에 딱 하나만 해도 괜찮아요</Text>
        </View>

        {/* Middle_Area */}
        <View style={styles.middleArea}>
          <Image source={LOGO_ICON} style={styles.logo} resizeMode="contain" />
        </View>

        {/* Bottom_Area */}
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
            <TouchableOpacity
              style={styles.btnKakao}
              activeOpacity={0.8}
              onPress={handleKakaoLogin}
              disabled={loading}
            >
              <Image source={KAKAO_ICON} style={styles.btnIcon} />
              <Text style={styles.btnKakaoText}>카카오로 시작하기</Text>
            </TouchableOpacity>

            {/* Apple 로그인은 iOS에서만 제공 (Android엔 네이티브 UI 없음) */}
            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={styles.btnApple}
                activeOpacity={0.8}
                onPress={handleAppleLogin}
                disabled={loading}
              >
                <Image source={APPLE_ICON} style={styles.btnIcon} />
                <Text style={styles.btnAppleText}>Apple로 시작하기</Text>
              </TouchableOpacity>
            )}

            {/* 게스트 버튼 */}
            <TouchableOpacity
              style={styles.guestButton}
              activeOpacity={0.7}
              onPress={handleGuestLogin}
              disabled={loading}
            >
              <Text style={styles.guestText}>
                {loading ? '로딩 중...' : '게스트로 시작하기'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>

      <HomeIndicatorSpacer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBarSpacer: {
    width: '100%',
  },
  contentArea: {
    flex: 1,
    justifyContent: 'space-between',
  },

  topArea: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 20,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 74,
    height: 140,
  },

  bottomArea: {
    alignItems: 'center',
  },

  bottomContentGroup: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 24,
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
});