import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { HomeIndicatorSpacer } from '../../../src/components/common/HomeIndicatorSpacer';
import { colors, typography, spacing } from '../../../src/constants';
import { useTerms } from '../../../src/context/TermsContext';

// TODO: 로컬 에셋 확인 필요
const ICON_CLOSE = require('../../../assets/images/Icon/Ic_Close.png');

const ARTICLES = [
  {
    id: 1,
    title: '제1조 (수집하는 개인정보)',
    body: '서비스는 카카오 로그인 시 아래 정보를 수집합니다.\n• 카카오 닉네임\n• 카카오 이메일\n• 프로필 사진',
  },
  {
    id: 2,
    title: '제2조 (수집 목적)',
    body: '① 서비스 회원 식별 및 로그인\n② 서비스 이용 내역 관리\n③ 푸시 알림 발송',
  },
  {
    id: 3,
    title: '제3조 (보유 기간)',
    body: '수집된 개인정보는 회원 탈퇴 시 즉시 삭제됩니다. 단, 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.',
  },
  {
    id: 4,
    title: '제4조 (제3자 제공)',
    body: '서비스는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다.',
  },
  {
    id: 5,
    title: '제5조 (이용자 권리)',
    body: '이용자는 언제든지 개인정보 열람, 수정, 삭제를 요청할 수 있습니다.',
  },
];

export default function PrivacyTermsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setAgreed } = useTerms();

  const handleAgree = () => {
    setAgreed('privacy', true);
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* 상태바 영역 */}
      <View style={[styles.statusBarSpacer, { height: Math.max(insets.top, 54) }]} />

      {/* 내비게이션 바 */}
      <View style={styles.navBar}>
        <Text style={styles.navTitle}>약관 동의</Text>
        <TouchableOpacity style={styles.closeButton} activeOpacity={0.7} onPress={() => router.back()}>
          <Image source={ICON_CLOSE} style={styles.closeIcon} />
        </TouchableOpacity>
      </View>

      {/* 스크롤 영역 */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>(필수) 개인정보처리방침</Text>

        {ARTICLES.map((article) => (
          <View key={article.id} style={styles.articleItem}>
            <Text style={styles.articleTitle}>{article.title}</Text>
            <Text style={styles.articleBody}>{article.body}</Text>
          </View>
        ))}
      </ScrollView>

      {/* 동의 버튼 */}
      <View style={styles.btnWrapper}>
        <TouchableOpacity style={styles.btnAgree} activeOpacity={0.8} onPress={handleAgree}>
          <Text style={styles.btnAgreeText}>동의하기</Text>
        </TouchableOpacity>
      </View>

      <HomeIndicatorSpacer />
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

  // ── NavBar ────────────────────────────────────────────────
  navBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingLeft: spacing.xl,
    paddingRight: spacing.xl,
    borderBottomWidth: 2,
    borderBottomColor: '#F7F7F7',
    backgroundColor: colors.surface.default,
  },
  navTitle: {
    ...typography.b1Subtitle,
    color: colors.text.primary,
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  closeButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },

  // ── ScrollArea ────────────────────────────────────────────
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.xxxl,
    paddingLeft: spacing.xl,
    paddingRight: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.xxl,
  },
  sectionTitle: {
    ...typography.t2Title2,
    color: colors.text.primary,
  },

  // 약관 조항
  articleItem: {
    gap: spacing.sm,
  },
  articleTitle: {
    ...typography.b2BodyBold,
    color: colors.text.primary,
  },
  articleBody: {
    ...typography.b4BodySm,
    color: colors.text.secondary,
  },

  // ── Btn_Wrapper ───────────────────────────────────────────
  btnWrapper: {
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    paddingLeft: spacing.xl,
    paddingRight: spacing.xl,
  },
  btnAgree: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.default,
    borderRadius: 12,
    overflow: 'hidden',
  },
  btnAgreeText: {
    ...typography.b2BodyBold,
    color: '#FFFFFF',
  },
});
