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

import { colors } from '@/src/constants/colors';

export default function MyPageScreen() {
  const [pushEnabled, setPushEnabled] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* NavBar */}
        <View style={styles.navBar}>
          <Text style={styles.navTitle}>설정</Text>
        </View>

        {/* Profile Area */}
        <View style={styles.profileArea}>
          <View style={styles.profileLeft}>
            <View style={styles.avatar} />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>김다은</Text>
              <Text style={styles.profileEmail}>Groom12@kakao.com</Text>
              <Text style={styles.profileAccount}>카카오 계정 연결됨</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.accountBtn} activeOpacity={0.7}>
            <Text style={styles.accountBtnText}>계정 관리</Text>
          </TouchableOpacity>
        </View>

        {/* Section Divider */}
        <View style={styles.sectionDivider} />

        {/* Settings List */}
        <View style={styles.settingsList}>

          {/* 알림 Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>알림</Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.listItemText}>푸쉬알림</Text>
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
                trackColor={{ false: '#E8E9EC', true: colors.primary.default }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#E8E9EC"
              />
            </View>
          </View>

          {/* 지원 Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>지원</Text>
            </View>
            <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
              <Text style={styles.listItemText}>문의하기</Text>
              <Ionicons name="chevron-forward" size={24} color={colors.text.tertiary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
              <Text style={styles.listItemText}>약관 및 정책</Text>
              <Ionicons name="chevron-forward" size={24} color={colors.text.tertiary} />
            </TouchableOpacity>
          </View>

          {/* 앱 버전 정보 Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>앱 버전 정보</Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.listItemText}>V.1.0.0</Text>
              <Text style={styles.versionStatus}>최신 버전 사용 중</Text>
            </View>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.default,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // NavBar
  navBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#F7F7F7',
    backgroundColor: colors.surface.default,
  },
  navTitle: {
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    color: colors.text.primary,
    letterSpacing: -0.5,
  },

  // Profile
  profileArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E9EC',
    backgroundColor: '#FFFFFF',
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#D9D9D9',
  },
  profileInfo: {
    gap: 4,
  },
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
  accountBtn: {
    borderWidth: 1,
    borderColor: colors.text.placeholder,
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

  // Section divider
  sectionDivider: {
    height: 8,
    backgroundColor: colors.surface.sunken,
  },

  // Settings
  settingsList: {
    backgroundColor: '#FFFFFF',
  },
  section: {
    flexDirection: 'column',
  },
  sectionHeader: {
    backgroundColor: '#FFFFFF',
    paddingTop: 24,
    paddingBottom: 8,
    paddingHorizontal: 20,
    alignItems: 'flex-start',
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Pretendard-Medium',
    color: colors.text.tertiary,
    lineHeight: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0,
  },
  listItemText: {
    fontSize: 16,
    fontFamily: 'Pretendard-Regular',
    color: colors.text.primary,
    lineHeight: 24,
  },
  versionStatus: {
    fontSize: 11,
    fontFamily: 'Pretendard-Regular',
    color: colors.text.tertiary,
    lineHeight: 14,
  },
});
