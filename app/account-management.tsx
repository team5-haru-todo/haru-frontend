import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, ActivityIndicator, Platform } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as AppleAuthentication from 'expo-apple-authentication';
import { login as kakaoLogin } from '@react-native-seoul/kakao-login';

import { colors } from '@/src/constants/colors';
import { StatusBarSpacer } from '@/src/components/common/StatusBarSpacer';
import { ConfirmDialog } from '@/src/components/common/ConfirmDialog';
import { GuestLogoutDialog } from '@/src/components/common/GuestLogoutDialog';
import { getMe, UserResponse } from '@/src/api/user';
import { logout, linkKakao, linkApple } from '@/src/api/auth';

const ICON_ARROW_LEFT = require('../assets/images/Icon/Arrow_left.png');
const ICON_ARROW_RIGHT = require('../assets/images/Icon/Arrow_Right_xs.png');

// TODO: 약관 화면(terms.tsx) 정식 연동 전까지 임시 고정값 사용
const TEMP_TERMS_VERSION = 'v1.0';

export default function AccountManagementScreen() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  const isGuest = user?.status === 'GUEST';

  const fetchData = async () => {
    try {
      const me = await getMe();
      setUser(me);
    } catch (error) {
      console.error('계정 정보 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const me = await getMe();
        if (isMounted) setUser(me);
      } catch (error) {
        console.error('계정 정보 조회 실패:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
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

  const handleLinkKakao = async () => {
    if (linking) return;
    setLinking(true);
    try {
      const kakaoToken = await kakaoLogin();
      await linkKakao({
        accessToken: kakaoToken.accessToken,
        termsVersion: TEMP_TERMS_VERSION,
        agreedAt: new Date().toISOString(),
      });
      await fetchData();
    } catch (error) {
      console.error('카카오 계정 연동 실패:', error);
      // TODO: 에러 발생 시 사용자에게 보여줄 알림 UI 추가 필요 (이미 연동된 계정인 경우 등)
    } finally {
      setLinking(false);
    }
  };

  const handleLinkApple = async () => {
    if (linking) return;
    setLinking(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error('Apple identityToken을 받지 못했습니다.');
      }

      await linkApple({
        identityToken: credential.identityToken,
        termsVersion: TEMP_TERMS_VERSION,
        agreedAt: new Date().toISOString(),
      });
      await fetchData();
    } catch (error: any) {
      if (error?.code === 'ERR_REQUEST_CANCELED') {
        // 사용자가 직접 취소한 경우 - 에러 처리 불필요
      } else {
        console.error('Apple 계정 연동 실패:', error);
        // TODO: 에러 발생 시 사용자에게 보여줄 알림 UI 추가 필요
      }
    } finally {
      setLinking(false);
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
            {isGuest ? (
              <View style={styles.profileTexts}>
                <Text style={styles.profileName}>게스트</Text>
                <Text style={styles.profileAccount}>게스트로 로그인</Text>
              </View>
            ) : (
              <View style={styles.profileTexts}>
                <Text style={styles.profileName}>{user?.nickname ?? '-'}</Text>
                <Text style={styles.profileAccount}>{connectedLabel}</Text>
              </View>
            )}
          </View>
        </View>

        {isGuest && (
          <>
            <View style={styles.sectionDivider} />
            <View style={styles.settingsList}>
              <View style={styles.sectionTitle}>
                <Text style={styles.sectionTitleText}>계정 연동</Text>
              </View>
              <TouchableOpacity
                style={styles.listItem}
                activeOpacity={0.7}
                onPress={handleLinkKakao}
                disabled={linking}
              >
                <Text style={styles.listItemText}>카카오 계정 연동하기</Text>
                <Image source={ICON_ARROW_RIGHT} style={styles.listIcon} />
              </TouchableOpacity>
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={styles.listItem}
                  activeOpacity={0.7}
                  onPress={handleLinkApple}
                  disabled={linking}
                >
                  <Text style={styles.listItemText}>Apple 계정 연동하기</Text>
                  <Image source={ICON_ARROW_RIGHT} style={styles.listIcon} />
                </TouchableOpacity>
              )}
            </View>
          </>
        )}

        <View style={styles.sectionDivider} />

        <View style={styles.contentArea}>
          <TouchableOpacity
            style={styles.btnLogout}
            activeOpacity={0.7}
            onPress={() => setLogoutDialogVisible(true)}
          >
            <Text style={styles.btnLogoutText}>로그아웃</Text>
          </TouchableOpacity>

          {!isGuest && (
            <TouchableOpacity
              style={styles.btnWithdraw}
              activeOpacity={0.7}
              onPress={() => router.push('/withdrawal')}
            >
              <Text style={styles.btnWithdrawText}>회원 탈퇴</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {isGuest ? (
        <GuestLogoutDialog
          visible={logoutDialogVisible}
          onLogout={handleConfirmLogout}
          onConnect={() => setLogoutDialogVisible(false)}
        />
      ) : (
        <ConfirmDialog
          visible={logoutDialogVisible}
          title="알림"
          description="로그아웃 하시겠습니까?"
          onCancel={() => setLogoutDialogVisible(false)}
          onConfirm={handleConfirmLogout}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingContainer: { justifyContent: 'center', alignItems: 'center' },
  scroll: { flexGrow: 1 },

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

  sectionDivider: { height: 12, backgroundColor: '#F4F5F7', width: '100%' },

  settingsList: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '100%',
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E9EC',
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 8,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    width: '100%',
  },
  sectionTitleText: {
    fontSize: 12,
    fontFamily: 'Pretendard-Medium',
    color: colors.text.tertiary,
    lineHeight: 16,
  },
  listItem: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    width: '100%',
  },
  listItemText: {
    fontSize: 16,
    fontFamily: 'Pretendard-Regular',
    color: colors.text.primary,
    lineHeight: 24,
  },
  listIcon: { width: 24, height: 24, resizeMode: 'contain' },

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