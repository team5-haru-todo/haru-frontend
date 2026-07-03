import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { colors } from '@/src/constants/colors';
import { StatusBarSpacer } from '@/src/components/common/StatusBarSpacer';
import { ConfirmDialog } from '@/src/components/common/ConfirmDialog';
import { getMe, UserResponse } from '@/src/api/user';
import { logout } from '@/src/api/auth';

const ICON_ARROW_LEFT = require('../assets/images/Icon/Arrow_left.png');
const ICON_AVATAR = require('../assets/images/Icon/Avatar.png');

export default function AccountManagementScreen() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        const me = await getMe();
        if (isMounted) setUser(me);
      } catch (error) {
        console.error('계정 정보 조회 실패:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const connectedLabel =
    user?.connectedProviders && user.connectedProviders.length > 0
      ? `${user.connectedProviders[0] === 'kakao' ? '카카오' : user.connectedProviders[0]} 계정 연결됨`
      : '연결된 계정 없음';

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/mypage');
    }
  };

  const handleConfirmLogout = async () => {
    setLogoutDialogVisible(false);
    try {
      await logout();
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <StatusBar style="dark" />
        <ActivityIndicator color={colors.text.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <StatusBarSpacer />

      {/* NavBar: Arrow_left + 계정 관리 (centered abs) */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={handleBack} style={styles.navLeft} activeOpacity={0.7}>
          <Image source={ICON_ARROW_LEFT} style={styles.icon} />
        </TouchableOpacity>
        <Text style={styles.navTitle} pointerEvents="none">계정 관리</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.profileArea}>
          <View style={styles.profileLeft}>
            <Image source={ICON_AVATAR} style={styles.avatar} resizeMode="cover" />
            <View style={styles.profileTexts}>
              <Text style={styles.profileName}>{user?.nickname ?? '-'}</Text>
              <Text style={styles.profileAccount}>{connectedLabel}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionDivider} />

        <View style={styles.contentArea}>
          <TouchableOpacity
            style={styles.btnLogout}
            activeOpacity={0.7}
            onPress={() => setLogoutDialogVisible(true)}
          >
            <Text style={styles.btnLogoutText}>로그아웃</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnWithdraw}
            activeOpacity={0.7}
            onPress={() => router.push('/withdrawal')}
          >
            <Text style={styles.btnWithdrawText}>회원 탈퇴</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={logoutDialogVisible}
        title="알림"
        description="로그아웃 하시겠습니까?"
        onCancel={() => setLogoutDialogVisible(false)}
        onConfirm={handleConfirmLogout}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingContainer: { justifyContent: 'center', alignItems: 'center' },
  scroll: { flexGrow: 1 },

  // NavBar: h=56, border-bottom 2px #F7F7F7, px=20
  navBar: {
    position: 'relative',
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: '#F7F7F7',
    backgroundColor: '#FFFFFF',
  },
  navLeft: {
    width: 44,
    height: 44,
    marginLeft: -10,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  icon: { width: 24, height: 24, resizeMode: 'contain' },

  // Profile_Area: h=122, border-bottom 1px #E8E9EC, px20 py24, items-center
  profileArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E9EC',
    backgroundColor: '#FFFFFF',
    width: '100%',
  },
  profileLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 74, height: 74, borderRadius: 37 },
  profileTexts: { gap: 4 },
  profileName: {
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    color: colors.text.primary,
    letterSpacing: -0.5,
    lineHeight: 26,
  },
  profileAccount: {
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
    color: colors.text.tertiary,
    lineHeight: 20,
  },

  // Divider_Section: h=12, #F4F5F7
  sectionDivider: { height: 12, backgroundColor: '#F4F5F7', width: '100%' },

  // Content_Area: gap=16, pt=24, pb=12, px=20, items-center
  contentArea: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    paddingTop: 24,
    paddingBottom: 12,
    paddingHorizontal: 20,
    width: '100%',
  },
  btnLogout: {
    width: '100%',
    height: 54,
    borderRadius: 12,
    backgroundColor: '#F4F5F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnLogoutText: {
    fontSize: 16,
    fontFamily: 'Pretendard-Bold',
    color: colors.text.primary,
    lineHeight: 24,
  },
  btnWithdraw: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  btnWithdrawText: {
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
    color: colors.text.placeholder,
    lineHeight: 20,
    textAlign: 'center',
  },
});
