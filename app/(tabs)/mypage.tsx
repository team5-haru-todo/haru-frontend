import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { colors } from '@/src/constants/colors';
import { layout } from '@/src/constants/layout';
import { StatusBarSpacer } from '@/src/components/common/StatusBarSpacer';

export default function MyPageScreen() {
  const [pushEnabled, setPushEnabled] = useState(true);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <StatusBarSpacer />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* NavBar: h=56, "설정" 절대 가운데, border-bottom 2px #F7F7F7 */}
        <View style={styles.navBar}>
          <Text style={styles.navTitle}>설정</Text>
        </View>

        {/* Profile_Area: px=20, py=24, border-bottom 1px #E8E9EC, items-start justify-between */}
        <View style={styles.profileArea}>
          {/* Profile_Left: gap=12, items-center */}
          <View style={styles.profileLeft}>
            {/* Avatar: 74x74 */}
            <Image
              source={require('../../assets/images/profile-avatar.png')}
              style={styles.avatar}
              resizeMode="cover"
            />
            {/* Group_ProfileText: gap=4 */}
            <View style={styles.profileTexts}>
              <Text style={styles.profileName}>김다은</Text>
              <Text style={styles.profileEmail}>Groom12@kakao.com</Text>
              <Text style={styles.profileAccount}>카카오 계정 연결됨</Text>
            </View>
          </View>
          {/* Btn_Account: border 1px #C2C6D0, rounded=16, px=12, py=4 */}
          <TouchableOpacity style={styles.accountBtn} activeOpacity={0.7}>
            <Text style={styles.accountBtnText}>계정 관리</Text>
          </TouchableOpacity>
        </View>

        {/* Divider_Section: h=8, #F4F5F7 */}
        <View style={styles.sectionDivider} />

        {/* Settings_List */}
        <View style={styles.settingsList}>

          {/* Section_Notification: flex-col, align-items flex-start */}
          <View style={styles.sectionGroup}>
            {/* Section_Title: pt=24, pb=8, pl=20 */}
            <View style={styles.sectionTitle}>
              <Text style={styles.sectionTitleText}>알림</Text>
            </View>
            {/* List_Item: h=52, px=20, justify-between */}
            <View style={styles.listItem}>
              <Text style={styles.listItemText}>푸쉬알림</Text>
              {/* iOS Toggle: w=51, h=31 */}
              {/* IOsToggle: w=51, h=31, borderRadius=16, track #65C466, knob 27x27 */}
              <TouchableOpacity
                accessibilityRole="switch"
                accessibilityState={{ checked: pushEnabled }}
                activeOpacity={0.8}
                onPress={() => setPushEnabled((enabled) => !enabled)}
                style={[styles.toggle, pushEnabled ? styles.toggleOn : styles.toggleOff]}
              >
                <View style={[styles.toggleKnob, pushEnabled ? styles.toggleKnobOn : styles.toggleKnobOff]} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Section_Support: flex-col, align-items flex-start */}
          <View style={styles.sectionGroup}>
            <View style={styles.sectionTitle}>
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

          {/* Section_Version: flex-col, align-items flex-start */}
          <View style={styles.sectionGroup}>
            <View style={styles.sectionTitle}>
              <Text style={styles.sectionTitleText}>앱 버전 정보</Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.listItemText}>V.1.0.0</Text>
              <Text style={styles.versionText}>최신 버전 사용 중</Text>
            </View>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  // Figma navigation_bar 88px already includes the bottom safe-area region.
  scroll: { paddingBottom: layout.tabBarHeight },

  // NavBar: h=56, border-bottom 2px #F7F7F7, title absolutely centered
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
    width: '100%',
  },
  // NavBar title: SemiBold 18px, lineHeight 26, letterSpacing -0.5, absolute centered
  navTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
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
    width: '100%',
  },
  // Profile_Left: gap=12, items-center
  profileLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  // Avatar: 74x74
  avatar: { width: 74, height: 74, borderRadius: 37 },
  // Group_ProfileText: gap=4
  profileTexts: { gap: 4 },
  // Name: SemiBold 18px, lineHeight 26, letterSpacing -0.5
  profileName: {
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    color: colors.text.primary,
    letterSpacing: -0.5,
    lineHeight: 26,
  },
  // Email: Medium 14px, lineHeight 20, secondary
  profileEmail: {
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
    color: colors.text.secondary,
    lineHeight: 20,
  },
  // Account: Medium 14px, lineHeight 20, tertiary
  profileAccount: {
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
    color: colors.text.tertiary,
    lineHeight: 20,
  },
  // Btn_Account: border 1px #C2C6D0, rounded=16, px=12, py=4
  accountBtn: {
    borderWidth: 1,
    borderColor: '#C2C6D0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#FFFFFF',
  },
  // Button text: Medium 12px, lineHeight 16, secondary
  accountBtnText: {
    fontSize: 12,
    fontFamily: 'Pretendard-Medium',
    color: colors.text.secondary,
    lineHeight: 16,
  },

  // Divider_Section: h=8, #F4F5F7
  sectionDivider: { height: 8, backgroundColor: '#F4F5F7', width: '100%' },

  // Settings_List: flex-col, items-start, overflow-clip, w=390, bg=white
  settingsList: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '100%',
    backgroundColor: '#FFFFFF',
  },

  // Section_Support / Section_Version: flex-col, align-items flex-start
  sectionGroup: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '100%',
  },

  // Section_Title: bg=white, flex, items-center, pb=8, pt=24, px=20
  // Figma는 좁은 컨테이너에서 justify-center 사용 → RN 전체 너비에서는 flex-start로 좌측 정렬
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 24,
    paddingBottom: 8,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    width: '100%',
  },
  // Section title text: Medium 12px, lineHeight 16, tertiary
  sectionTitleText: {
    fontSize: 12,
    fontFamily: 'Pretendard-Medium',
    color: colors.text.tertiary,
    lineHeight: 16,
  },

  // List_Item: h=52, px=20, flex-row, items-center, justify-between
  listItem: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    width: '100%',
  },
  // List item text: Regular 16px, lineHeight 24, text-primary
  listItemText: {
    fontSize: 16,
    fontFamily: 'Pretendard-Regular',
    color: colors.text.primary,
    lineHeight: 24,
  },
  toggle: {
    width: 51,
    height: 31,
    borderRadius: 16,
    position: 'relative',
  },
  toggleOn: { backgroundColor: '#65C466' },
  toggleOff: { backgroundColor: '#E8E9EC' },
  toggleKnob: {
    position: 'absolute',
    top: 2,
    width: 27,
    height: 27,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 3.5,
    elevation: 2,
  },
  toggleKnobOn: { right: 2 },
  toggleKnobOff: { left: 2 },
  // Version right text: Regular 11px, lineHeight 14, tertiary
  versionText: {
    fontSize: 11,
    fontFamily: 'Pretendard-Regular',
    color: colors.text.tertiary,
    lineHeight: 14,
  },
});
