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
    title: '제1조 (목적)',
    body: '본 약관은 하루한개(이하 "서비스")를 이용함에 있어 서비스 제공자와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.',
  },
  {
    id: 2,
    title: '제2조 (서비스 이용)',
    body: '① 서비스는 매일 하나의 할 일을 등록하고 완료할 수 있는 기능을 제공합니다.\n② 등록된 할 일은 자정에 자동으로 초기화됩니다.\n③ 서비스는 카카오 계정을 통해 로그인할 수 있습니다.',
  },
  {
    id: 3,
    title: '제3조 (이용자 의무)',
    body: '① 이용자는 타인의 정보를 도용하거나 허위 정보를 등록해서는 안 됩니다.\n② 서비스의 정상적인 운영을 방해하는 행위를 해서는 안 됩니다.',
  },
  {
    id: 4,
    title: '제4조 (서비스 중단)',
    body: '서비스 제공자는 시스템 점검, 장애 등의 사유로 서비스를 일시 중단할 수 있습니다.',
  },
  {
    id: 5,
    title: '제5조 (면책)',
    body: '서비스 제공자는 천재지변, 서비스 장애 등 불가항력적인 사유로 발생한 손해에 대해 책임을 지지 않습니다.',
  },
];

export default function ServiceTermsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setAgreed } = useTerms();

  const handleAgree = () => {
    setAgreed('service', true);
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
        <Text style={styles.sectionTitle}>(필수) 서비스 이용약관</Text>

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
