import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { HomeIndicatorSpacer } from '../../../src/components/common/HomeIndicatorSpacer';
import { colors, typography, spacing } from '../../../src/constants';
import { useTerms } from '../../../src/context/TermsContext';

// TODO: 로컬 에셋 확인 필요
const ICON_CLOSE = require('../../../assets/images/Icon/Ic_Close.png');

const SECTIONS = [
  {
    id: 1,
    title: '수신 동의 내용',
    body: '① 서비스의 새로운 기능, 업데이트 소식을 푸시 알림으로 받아보실 수 있습니다.\n② 마케팅 수신 동의는 선택사항이며, 동의하지 않아도 서비스 이용에 제한이 없습니다.\n③ 마케팅 수신 동의는 설정 페이지에서 언제든지 변경할 수 있습니다.',
  },
  {
    id: 2,
    title: '수신 채널',
    body: '푸시 알림',
  },
  {
    id: 3,
    title: '시행일',
    body: '2026년 7월 13일',
  },
];

export default function MarketingTermsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setAgreed } = useTerms();

  const handleAgree = () => {
    setAgreed('marketing', true);
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
        <Text style={styles.sectionTitle}>마케팅 수신 동의</Text>

        {SECTIONS.map((section) => (
          <View key={section.id} style={styles.articleItem}>
            <Text style={styles.articleTitle}>{section.title}</Text>
            <Text style={styles.articleBody}>{section.body}</Text>
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

  // 섹션 항목
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
