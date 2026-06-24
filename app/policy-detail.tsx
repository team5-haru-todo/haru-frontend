import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import { colors } from '@/src/constants/colors';

type PolicyType = 'terms' | 'privacy' | 'marketing';

const CONTENT: Record<PolicyType, {
  title: string;
  articles: { heading: string; body: string }[];
}> = {
  terms: {
    title: '(필수) 서비스 이용약관',
    articles: [
      {
        heading: '제1조 (목적)',
        body: '본 약관은 하루한개(이하 "서비스")를 이용함에 있어 서비스 제공자와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.',
      },
      {
        heading: '제2조 (서비스 이용)',
        body: '① 서비스는 매일 하나의 할 일을 등록하고 완료할 수 있는 기능을 제공합니다.\n② 등록된 할 일은 자정에 자동으로 초기화됩니다.\n③ 서비스는 카카오 계정을 통해 로그인할 수 있습니다.',
      },
      {
        heading: '제3조 (이용자 의무)',
        body: '① 이용자는 타인의 정보를 도용하거나 허위 정보를 등록해서는 안 됩니다.\n② 서비스의 정상적인 운영을 방해하는 행위를 해서는 안 됩니다.',
      },
      {
        heading: '제4조 (서비스 중단)',
        body: '서비스 제공자는 시스템 점검, 장애 등의 사유로 서비스를 일시 중단할 수 있습니다.',
      },
      {
        heading: '제5조 (면책)',
        body: '서비스 제공자는 천재지변, 서비스 장애 등 불가항력적인 사유로 발생한 손해에 대해 책임을 지지 않습니다.',
      },
    ],
  },
  privacy: {
    title: '(필수) 개인정보처리방침',
    articles: [
      {
        heading: '제1조 (수집하는 개인정보)',
        body: '서비스는 카카오 로그인 시 아래 정보를 수집합니다.\n카카오 닉네임\n카카오 이메일\n프로필 사진',
      },
      {
        heading: '제2조 (수집 목적)',
        body: '① 서비스 회원 식별 및 로그인\n② 서비스 이용 내역 관리\n③ 푸시 알림 발송',
      },
      {
        heading: '제3조 (보유 기간)',
        body: '수집된 개인정보는 회원 탈퇴 시 즉시 삭제됩니다. 단, 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.',
      },
      {
        heading: '제4조 (제3자 제공)',
        body: '서비스는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다.',
      },
      {
        heading: '제5조 (이용자 권리)',
        body: '이용자는 언제든지 개인정보 열람, 수정, 삭제를 요청할 수 있습니다.',
      },
    ],
  },
  marketing: {
    title: '마케팅 수신 동의',
    articles: [
      {
        heading: '수신 동의 내용',
        body: '① 서비스의 새로운 기능, 업데이트 소식을 푸시 알림으로 받아보실 수 있습니다.\n② 마케팅 수신 동의는 선택사항이며, 동의하지 않아도 서비스 이용에 제한이 없습니다.\n③ 마케팅 수신 동의는 설정 페이지에서 언제든지 변경할 수 있습니다.',
      },
      {
        heading: '수신 채널',
        body: '푸시 알림',
      },
      {
        heading: '시행일',
        body: '2026년 7월 13일',
      },
    ],
  },
};

export default function PolicyDetailScreen() {
  const { type } = useLocalSearchParams<{ type: PolicyType }>();
  const content = CONTENT[type ?? 'terms'];

  return (
    <SafeAreaView style={styles.container}>
      {/* NavBar: 약관 및 정책 (centered) + X close button on RIGHT */}
      <View style={styles.navBar}>
        <Text style={styles.navTitle}>약관 및 정책</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* ScrollArea: pt=32, px=20 */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title: Bold 20px, lineHeight 32 */}
        <Text style={styles.title}>{content.title}</Text>

        {/* Articles: gap=24 between each */}
        <View style={styles.articleList}>
          {content.articles.map((article, i) => (
            <View key={i} style={styles.article}>
              <Text style={styles.articleHeading}>{article.heading}</Text>
              <Text style={styles.articleBody}>{article.body}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  // NavBar: h=56, title centered, X at right x=346 (px=20 from right)
  navBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#F7F7F7',
    backgroundColor: '#FFFFFF',
  },
  navTitle: {
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    color: colors.text.primary,
    letterSpacing: -0.5,
    lineHeight: 26,
  },
  // X close button: absolute at right=20
  closeBtn: {
    position: 'absolute',
    right: 20,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ScrollArea: pt=32, px=20
  scrollContent: {
    paddingTop: 32,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // Title: Bold 20px, lineHeight 32
  title: {
    fontSize: 20,
    fontFamily: 'Pretendard-Bold',
    color: colors.text.primary,
    lineHeight: 32,
  },

  // Article list: gap=24 between items, marginTop=24 from title
  articleList: {
    marginTop: 24,
    gap: 24,
  },

  // Article: heading + body
  article: {
    flexDirection: 'column',
    gap: 8,
  },
  // Article heading: SemiBold 16px, lineHeight 24
  articleHeading: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: colors.text.primary,
    lineHeight: 24,
  },
  // Article body: Regular 14px, lineHeight 20
  articleBody: {
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    color: colors.text.secondary,
    lineHeight: 20,
  },
});
