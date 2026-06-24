import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { colors } from '@/src/constants/colors';

export default function MyPageScreen() {
  const [pushEnabled, setPushEnabled] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* NavBar — h=56, border-bottom 2px #F7F7F7, title centered */}
        <View style={styles.navBar}>
          <Text style={styles.navTitle}>설정</Text>
        </View>

        {/* Profile_Area — px=20, py=24, border-bottom 1px #E8E9EC, items-start */}
        <View style={styles.profileArea}>
          <View style={styles.profileLeft}>
            {/* Avatar — 74x74 */}
            <View style={styles.avatar} />
            {/* Profile text group — gap=4 */}
            <View style={styles.profileTexts}>
              <Text style={styles.profileName}>김다은</Text>
              <Text style={styles.profileEmail}>Groom12@kakao.com</Text>
              <Text style={styles.profileAccount}>카카오 계정 연결됨</Text>
            </View>
          </View>
          {/* Btn_Account — border #C2C6D0, rounded=16, px=12, py=4 */}
          <TouchableOpacity style={styles.accountBtn} activeOpacity={0.7}>
            <Text style={styles.accountBtnText}>계정 관리</Text>
          </TouchableOpacity>
        </View>

        {/* Divider_Section — h=8, #F4F5F7 */}
        <View style={styles.sectionDivider} />

        {/* Settings_List */}
        <View style={styles.settingsList}>

          {/* Section_Notification */}
          <View style={styles.sectionGroup}>
            {/* Section_Title — pb=8, pt=24, px=20 */}
            <View style={styles.sectionTitleWrap}>
              <Text style={styles.sectionTitleText}>알림</Text>
            </View>
            {/* List_Item — h=52, px=20 */}
            <View style={styles.listItem}>
              <Text style={styles.listItemText}>푸쉬알림</Text>
              {/* IOsToggle — h=31, w=51 */}
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
                trackColor={{ false: '#E8E9EC', true: colors.primary.default }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#E8E9EC"
                style={styles.toggle}
              />
            </View>
          </View>

          {/* Section_Support */}
          <View style={styles.sectionGroup}>
            <View style={styles.sectionTitleWrap}>
              <Text style={styles.sectionTitleText}>지원</Text>
            </View>
            <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
              <Text style={styles.listItemText}>문의하기</Text>
              <Ionicons name="chevron-forward" size={24} color={colors.text.tertiary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.listItem}
              activeOpacity={0.7}
              onPress={() => router.push('/policy')}
            >
              <Text style={styles.listItemText}>약관 및 정책</Text>
              <Ionicons name="chevron-forward" size={24} color={colors.text.tertiary} />
            </TouchableOpacity>
          </View>

          {/* Section_Version */}
          <View style={styles.sectionGroup}>
            <View style={styles.sectionTitleWrap}>
              <Text style={styles.sectionTitleText}>앱 버전 정보</Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.listItemText}>V.1.0.0</Text>
              <Text style={styles.versionText}>최신 버전 사용 중</Text>
            </View>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingBottom: 96 },

  // NavBar: h=56, border-bottom 2px #F7F7F7, px=20, py=14
  navBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
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

  // Profile_Area: px=20, py=24, border-bottom 1px #E8E9EC, items-start, justify-between
  profileArea: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E9EC',
    backgroundColor: '#FFFFFF',
  },
  profileLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  // Avatar: 74x74
  avatar: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#D9D9D9',
  },
  // Profile text group: gap=4
  profileTexts: { flexDirection: 'column', gap: 4 },
  profileName: {
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    color: colors.text.primary,
    letterSpacing: -0.5,
    lineHeight: 26,
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
    color: colors.text.secondary,
    lineHeight: 20,
  },
  profileAccount: {
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
    color: colors.text.tertiary,
    lineHeight: 20,
  },
  // Btn_Account: border #C2C6D0, rounded=16, px=12, py=4
  accountBtn: {
    borderWidth: 1,
    borderColor: '#C2C6D0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#FFFFFF',
  },
  accountBtnText: {
    fontSize: 12,
    fontFamily: 'Pretendard-Medium',
    color: colors.text.secondary,
    lineHeight: 16,
  },

  // Divider_Section: h=8, #F4F5F7
  sectionDivider: { height: 8, backgroundColor: '#F4F5F7' },

  settingsList: { backgroundColor: '#FFFFFF' },

  sectionGroup: { flexDirection: 'column' },

  // Section_Title container: pb=8, pt=24, px=20, items-center, justify-center
  sectionTitleWrap: {
    paddingTop: 24,
    paddingBottom: 8,
    paddingHorizontal: 20,
    alignItems: 'flex-start',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  // Section title text: Medium 12px, lineHeight 16, tertiary
  sectionTitleText: {
    fontSize: 12,
    fontFamily: 'Pretendard-Medium',
    color: colors.text.tertiary,
    lineHeight: 16,
  },

  // List_Item: h=52, px=20, justify-between, items-center
  listItem: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  // List item text: Regular 16px, lineHeight 24, text-primary
  listItemText: {
    fontSize: 16,
    fontFamily: 'Pretendard-Regular',
    color: colors.text.primary,
    lineHeight: 24,
  },
  // IOsToggle dimensions match Figma: h=31, w=51
  toggle: { transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] },
  // Version right text: Regular 11px, lineHeight 14, tertiary
  versionText: {
    fontSize: 11,
    fontFamily: 'Pretendard-Regular',
    color: colors.text.tertiary,
    lineHeight: 14,
  },
});
