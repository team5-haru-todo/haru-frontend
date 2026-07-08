import { colors, spacing, typography } from '@/src/constants';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { HomeIndicatorSpacer } from '../../src/components/common/HomeIndicatorSpacer';
import { AlreadyLinkedDialog } from '../../src/components/common/AlreadyLinkedDialog';
import { useTerms } from '../../src/context/TermsContext';
import { linkApple, linkKakao, loginWithApple, loginWithKakao } from '@/src/api/auth';
import { useUserStore } from '@/src/store/userStore';

const ICON_ARROW_LEFT = require('../../assets/images/Icon/Arrow_left.png');
const ICON_CHECKBOX_ON = require('../../assets/images/Icon/Ic_Check.png');
const ICON_CHECKBOX_OFF = require('../../assets/images/Icon/Ic_Check_off.png');
const ICON_CHECK_LINE_ON = require('../../assets/images/Icon/Ic_check_line_on.png');
const ICON_CHECK_LINE_OFF = require('../../assets/images/Icon/Ic_check_line_off.png');
const ICON_ARROW_RIGHT = require('../../assets/images/Icon/Arrow_Right_xs.png');

// TODO: 약관 버전 관리 정책(서버/노션 등) 확정 전까지 임시 고정값 사용
const TERMS_VERSION = 'v1.0';

const TERMS: { id: number; key: 'service' | 'privacy' | 'marketing'; label: string; route: string }[] = [
  { id: 1, key: 'service', label: '(필수) 서비스 이용약관', route: '/terms/service' },
  { id: 2, key: 'privacy', label: '(필수) 개인정보처리방침', route: '/terms/privacy' },
  { id: 3, key: 'marketing', label: '마케팅 수신 동의', route: '/terms/marketing' },
];

export default function TermsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { agreed, allChecked, requiredChecked, toggleAll } = useTerms();
  const fetchUser = useUserStore((state) => state.fetchUser);
  const [submitting, setSubmitting] = useState(false);
  const [alreadyLinkedVisible, setAlreadyLinkedVisible] = useState(false);

  // login.tsx(신규 가입) 또는 account-management.tsx(게스트 계정 연동)에서
  // 이 화면으로 넘어올 때 함께 전달된 정보. mode로 두 경로를 구분한다.
  const { provider, kakaoAccessToken, appleIdentityToken, mode } = useLocalSearchParams<{
    provider?: string;
    kakaoAccessToken?: string;
    appleIdentityToken?: string;
    mode?: string;
  }>();

  const isLinkMode = mode === 'link';

  const handleBack = () => {
    router.back();
  };

  const handleAgree = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const agreedAt = new Date().toISOString();

      if (isLinkMode) {
        // 게스트 계정에 소셜 계정 연동
        if (provider === 'kakao' && kakaoAccessToken) {
          await linkKakao({ accessToken: kakaoAccessToken, termsVersion: TERMS_VERSION, agreedAt });
        } else if (provider === 'apple' && appleIdentityToken) {
          await linkApple({ identityToken: appleIdentityToken, termsVersion: TERMS_VERSION, agreedAt });
        } else {
          console.error('약관 동의 처리 실패: 연동 토큰 정보가 없습니다.');
          return;
        }
        await fetchUser();
        router.replace('/account-management');
        return;
      }

      // 신규 가입 (로그인 화면에서 온 경우)
      let accessToken: string;
      let user;

      if (provider === 'kakao' && kakaoAccessToken) {
        const result = await loginWithKakao({
          accessToken: kakaoAccessToken,
          termsVersion: TERMS_VERSION,
          agreedAt,
        });
        accessToken = result.accessToken;
        user = result.user;
      } else if (provider === 'apple' && appleIdentityToken) {
        const result = await loginWithApple({
          identityToken: appleIdentityToken,
          termsVersion: TERMS_VERSION,
          agreedAt,
        });
        accessToken = result.accessToken;
        user = result.user;
      } else {
        console.error('약관 동의 처리 실패: 로그인 토큰 정보가 없습니다.');
        return;
      }

      if (Platform.OS !== 'web') {
        await SecureStore.setItemAsync('authToken', accessToken);
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
              <TouchableOpacity
                key={term.id}
                style={styles.termItem}
                activeOpacity={0.7}
                onPress={() => router.push(term.route as any)}
              >
                <Image
                  source={agreed[term.key] ? ICON_CHECK_LINE_ON : ICON_CHECK_LINE_OFF}
                  style={styles.termIcon}
                />
                <Text style={styles.termLabel}>{term.label}</Text>
                <Image source={ICON_ARROW_RIGHT} style={styles.termIcon} />
              </TouchableOpacity>
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