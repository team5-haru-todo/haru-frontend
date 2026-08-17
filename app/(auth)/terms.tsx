import { colors, spacing, typography } from '@/src/constants';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { HomeIndicatorSpacer } from '../../src/components/common/HomeIndicatorSpacer';
import { AlreadyLinkedDialog } from '../../src/components/common/AlreadyLinkedDialog';
import { useTerms } from '../../src/context/TermsContext';
import { linkApple, linkKakao, loginAsGuest, loginWithApple, loginWithKakao } from '@/src/api/auth';
import { useUserStore } from '@/src/store/userStore';

const ICON_ARROW_LEFT = require('../../assets/images/Icon/Arrow_left.png');
const ICON_CHECKBOX_ON = require('../../assets/images/Icon/Ic_Check.png');
const ICON_CHECKBOX_OFF = require('../../assets/images/Icon/Ic_Check_off.png');
const ICON_CHECK_LINE_ON = require('../../assets/images/Icon/Ic_check_line_on.png');
const ICON_CHECK_LINE_OFF = require('../../assets/images/Icon/Ic_check_line_off.png');
const ICON_ARROW_RIGHT = require('../../assets/images/Icon/Arrow_Right_xs.png');

// TODO: 약관 버전 관리 정책(서버/노션 등) 확정 전까지 임시 고정값 사용
const TERMS_VERSION = 'v1.0';

type TermsKey = 'service' | 'privacy' | 'marketing' | 'age';

const TERMS: { id: number; key: TermsKey; label: string; route?: string }[] = [
  // 상세 약관 문서가 없는 자기 신고형 체크박스 — route 없음, 탭하면 바로 토글된다.
  { id: 1, key: 'age', label: '(필수) 만 14세 이상입니다' },
  { id: 2, key: 'service', label: '(필수) 서비스 이용약관', route: '/terms/service' },
  { id: 3, key: 'privacy', label: '(필수) 개인정보처리방침', route: '/terms/privacy' },
  { id: 4, key: 'marketing', label: '(선택) 마케팅 수신 동의', route: '/terms/marketing' },
];

export default function TermsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { agreed, allChecked, requiredChecked, toggleAll, setAgreed } = useTerms();
  const fetchUser = useUserStore((state) => state.fetchUser);
  const currentUser = useUserStore((state) => state.user);
  const [submitting, setSubmitting] = useState(false);
  const [alreadyLinkedVisible, setAlreadyLinkedVisible] = useState(false);

  // login.tsx(신규 가입/게스트) 또는 account-management.tsx(게스트 계정 연동)에서
  // 이 화면으로 넘어올 때 함께 전달된 정보. mode/provider로 세 경로를 구분한다.
  const { provider, kakaoAccessToken, appleIdentityToken, mode } = useLocalSearchParams<{
    provider?: string;
    kakaoAccessToken?: string;
    appleIdentityToken?: string;
    mode?: string;
  }>();

  const isLinkMode = mode === 'link';
  const isGuestMode = provider === 'guest';

  // 연동(link) 모드일 때, 게스트로 있을 때 이미 같은 버전 약관에 동의한 이력이 있으면
  // 처음부터 다시 다 체크하게 하지 않고 자동으로 체크된 상태로 보여준다.
  // (단, 동의 이력 자체는 연동 시점에 다시 기록된다 — 실명 연동으로 처리 성격이 바뀌기 때문)
  useEffect(() => {
    if (isLinkMode && currentUser?.termsVersion === TERMS_VERSION) {
      setAgreed('service', true);
      setAgreed('privacy', true);
      setAgreed('marketing', true);
      setAgreed('age', true);
    }
  }, [isLinkMode, currentUser?.termsVersion]);

  const handleBack = () => {
    router.back();
  };

  const handleAgree = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const agreedAt = new Date().toISOString();

      if (isGuestMode) {
        // 게스트 최초 진입 — 약관 동의 후 게스트 계정 생성
        const { accessToken, refreshToken, user } = await loginAsGuest({ termsVersion: TERMS_VERSION, agreedAt });
        if (Platform.OS !== 'web') {
          await SecureStore.setItemAsync('authToken', accessToken);
          await SecureStore.setItemAsync('refreshToken', refreshToken);
        }
        await fetchUser();
        router.replace(user.hasSeenOnboarding ? '/(tabs)' : '/(tutorial)');
        return;
      }

      if (isLinkMode) {
        // 게스트 계정에 소셜 계정 연동
        // linkKakao/linkApple은 내부적으로 Refresh Token을 로테이션(재발급)하므로,
        // 응답으로 온 새 토큰을 반드시 저장해야 기존 게스트 세션의 자동 재인증이 계속 유효하다.
        let linkedAccessToken: string;
        let linkedRefreshToken: string;

        if (provider === 'kakao' && kakaoAccessToken) {
          const result = await linkKakao({ accessToken: kakaoAccessToken, termsVersion: TERMS_VERSION, agreedAt });
          linkedAccessToken = result.accessToken;
          linkedRefreshToken = result.refreshToken;
        } else if (provider === 'apple' && appleIdentityToken) {
          const result = await linkApple({ identityToken: appleIdentityToken, termsVersion: TERMS_VERSION, agreedAt });
          linkedAccessToken = result.accessToken;
          linkedRefreshToken = result.refreshToken;
        } else {
          console.error('약관 동의 처리 실패: 연동 토큰 정보가 없습니다.');
          return;
        }

        if (Platform.OS !== 'web') {
          await SecureStore.setItemAsync('authToken', linkedAccessToken);
          await SecureStore.setItemAsync('refreshToken', linkedRefreshToken);
        }
        await fetchUser();
        router.replace('/account-management');
        return;
      }

      // 신규 가입 (로그인 화면에서 온 경우)
      let accessToken: string;
      let refreshToken: string;
      let user;

      if (provider === 'kakao' && kakaoAccessToken) {
        const result = await loginWithKakao({
          accessToken: kakaoAccessToken,
          termsVersion: TERMS_VERSION,
          agreedAt,
        });
        accessToken = result.accessToken;
        refreshToken = result.refreshToken;
        user = result.user;
      } else if (provider === 'apple' && appleIdentityToken) {
        const result = await loginWithApple({
          identityToken: appleIdentityToken,
          termsVersion: TERMS_VERSION,
          agreedAt,
        });
        accessToken = result.accessToken;
        refreshToken = result.refreshToken;
        user = result.user;
      } else {
        console.error('약관 동의 처리 실패: 로그인 토큰 정보가 없습니다.');
        return;
      }

      if (Platform.OS !== 'web') {
        await SecureStore.setItemAsync('authToken', accessToken);
        await SecureStore.setItemAsync('refreshToken', refreshToken);
      }
      await fetchUser();
      router.replace(user.hasSeenOnboarding ? '/(tabs)' : '/(tutorial)');
    } catch (error: any) {
      if (error?.response?.status === 409) {
        // 이미 다른 계정에 연동된 소셜 계정으로 시도한 경우
        setAlreadyLinkedVisible(true);
      } else {
        console.error('약관 동의 처리 실패:', error);
        // TODO: 그 외 에러에 대한 사용자 안내 UI 추가 필요
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleAlreadyLinkedConfirm = () => {
    setAlreadyLinkedVisible(false);
    // 연동 시도였다면 계정 관리 화면으로, 로그인 시도였다면 로그인 화면으로 되돌려보낸다.
    if (isLinkMode) {
      router.replace('/account-management');
    } else {
      router.replace('/(auth)/login');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={[styles.statusBarSpacer, { height: Math.max(insets.top, 54) }]} />

      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={handleBack}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <Image source={ICON_ARROW_LEFT} style={styles.navIcon} />
        </TouchableOpacity>
        <Text style={styles.navTitle} pointerEvents="none">약관 동의</Text>
      </View>

      <View style={styles.contentArea}>
        <View style={styles.groupTerms}>
          <Text style={styles.sectionTitle}>
            서비스 이용을 위해 꼭 필요한 동의만 담았어요
          </Text>

          <TouchableOpacity style={styles.cardAllAgree} activeOpacity={0.8} onPress={toggleAll}>
            <View style={styles.checkboxAllOuter}>
              <Image
                source={allChecked ? ICON_CHECKBOX_ON : ICON_CHECKBOX_OFF}
                style={styles.checkboxAllIcon}
              />
            </View>
            <View style={styles.cardTextGroup}>
              <Text style={styles.cardTitle}>전체 동의하기</Text>
              <Text style={styles.cardSubtitle}>
                서비스 이용을 위해 최초 1회 약관동의가 필요해요
              </Text>
            </View>
          </TouchableOpacity>

          <View>
            {TERMS.map((term) => (
              <View key={term.id} style={styles.termItem}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setAgreed(term.key, !agreed[term.key])}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Image
                    source={agreed[term.key] ? ICON_CHECK_LINE_ON : ICON_CHECK_LINE_OFF}
                    style={styles.termIcon}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.termLabelArea}
                  activeOpacity={0.7}
                  onPress={() =>
                    term.route
                      ? router.push(term.route as any)
                      : setAgreed(term.key, !agreed[term.key])
                  }
                >
                  <Text style={styles.termLabel}>{term.label}</Text>
                  {term.route && <Image source={ICON_ARROW_RIGHT} style={styles.termIcon} />}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.btnAgree, requiredChecked ? styles.btnAgreeActive : styles.btnAgreeDisabledBg]}
          disabled={!requiredChecked || submitting}
          activeOpacity={0.8}
          onPress={handleAgree}
        >
          <Text style={requiredChecked ? styles.btnAgreeTextActive : styles.btnAgreeText}>
            {submitting ? '처리 중...' : '동의하고 시작하기'}
          </Text>
        </TouchableOpacity>
      </View>

      <HomeIndicatorSpacer />

      <AlreadyLinkedDialog visible={alreadyLinkedVisible} onConfirm={handleAlreadyLinkedConfirm} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface.default },
  statusBarSpacer: { width: '100%' },

  navBar: {
    position: 'relative',
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.xl,
    paddingRight: spacing.xl,
    borderBottomWidth: 2,
    borderBottomColor: '#F7F7F7',
    backgroundColor: colors.surface.default,
  },
  backButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  navIcon: { width: 24, height: 24, resizeMode: 'contain' },
  navTitle: {
    ...typography.b1Subtitle,
    color: colors.text.primary,
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
  },

  contentArea: {
    flex: 1,
    paddingTop: spacing.xxxl,
    paddingLeft: spacing.xl,
    paddingRight: spacing.xl,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },

  groupTerms: { gap: spacing.xxl },
  sectionTitle: { ...typography.t2Title2, color: colors.text.primary },

  cardAllAgree: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.surface.sunken,
    borderRadius: 12,
    padding: spacing.lg,
  },
  checkboxAllOuter: { width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
  checkboxAllIcon: { width: 20, height: 20, resizeMode: 'contain' },
  cardTextGroup: { flex: 1, gap: spacing.xs },
  cardTitle: { ...typography.b2BodyMedium, color: colors.text.primary },
  cardSubtitle: { ...typography.c1Caption, color: colors.text.tertiary },

  termItem: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface.default,
    overflow: 'hidden',
  },
  termIcon: { width: 24, height: 24, resizeMode: 'contain' },
  termLabelArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  termLabel: { ...typography.b3BodyRegular, color: colors.text.primary, flex: 1 },

  btnAgree: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    overflow: 'hidden',
  },
  btnAgreeDisabledBg: { backgroundColor: '#E8E9EC' },
  btnAgreeActive: { backgroundColor: colors.primary.default },
  btnAgreeText: { ...typography.b2BodyBold, color: colors.text.tertiary },
  btnAgreeTextActive: { ...typography.b2BodyBold, color: '#FFFFFF' },
});