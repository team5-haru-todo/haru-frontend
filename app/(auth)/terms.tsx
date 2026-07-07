import { colors, spacing, typography } from '@/src/constants';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { HomeIndicatorSpacer } from '../../src/components/common/HomeIndicatorSpacer';
import { useTerms } from '../../src/context/TermsContext';
import { loginWithApple, loginWithKakao } from '@/src/api/auth';
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

  // login.tsx에서 신규 유저로 판별되어 이 화면으로 넘어올 때 함께 전달된 소셜 토큰
  const { provider, kakaoAccessToken, appleIdentityToken } = useLocalSearchParams<{
    provider?: string;
    kakaoAccessToken?: string;
    appleIdentityToken?: string;
  }>();

  const handleAgree = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const agreedAt = new Date().toISOString();
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
      // 이 화면은 신규 유저만 오는 경로라 hasSeenOnboarding은 항상 false지만, 방어적으로 그대로 분기
      router.replace(user.hasSeenOnboarding ? '/(tabs)' : '/(tutorial)');
    } catch (error) {
      console.error('약관 동의 후 가입 처리 실패:', error);
      // TODO: 에러 발생 시 사용자에게 보여줄 알림 UI 추가 필요
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={[styles.statusBarSpacer, { height: Math.max(insets.top, 54) }]} />

      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={() => router.back()}>
          <Image source={ICON_ARROW_LEFT} style={styles.navIcon} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>약관 동의</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface.default },
  statusBarSpacer: { width: '100%' },

  navBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.xl,
    paddingRight: spacing.xl,
    borderBottomWidth: 2,
    borderBottomColor: '#F7F7F7',
    backgroundColor: colors.surface.default,
  },
  backButton: { width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
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