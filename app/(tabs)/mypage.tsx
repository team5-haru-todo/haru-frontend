import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { colors } from '@/src/constants/colors';
import { layout } from '@/src/constants/layout';
import { StatusBarSpacer } from '@/src/components/common/StatusBarSpacer';
import { getMySettings, updateMySettings } from '@/src/api/user';
import { useUserStore } from '@/src/store/userStore';

const ICON_AVATAR = require('../../assets/images/Icon/Avatar.png');
const ICON_ARROW_RIGHT = require('../../assets/images/Icon/Arrow_Right_xs.png');

export default function MyPageScreen() {
  const user = useUserStore((state) => state.user);
  const fetchUser = useUserStore((state) => state.fetchUser);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        if (!user) {
          await fetchUser();
        }
        const settings = await getMySettings();
        if (!isMounted) return;
        setPushEnabled(settings.pushEnabled);
      } catch (error) {
        console.error('마이페이지 정보 조회 실패:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleTogglePush = async () => {
    const next = !pushEnabled;
    setPushEnabled(next);
    try {
      await updateMySettings(next);
    } catch (error) {
      console.error('푸시알림 설정 변경 실패:', error);
      setPushEnabled(!next);
    }
  };

  const connectedLabel =
    user?.connectedProviders && user.connectedProviders.length > 0
      ? `${user.connectedProviders[0] === 'kakao' ? '카카오' : user.connectedProviders[0]} 계정 연결됨`
      : '연결된 계정 없음';

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
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.navBar}>
          <Text style={styles.navTitle}>설정</Text>
        </View>

        <View style={styles.profileArea}>
          <View style={styles.profileLeft}>
            <Image source={ICON_AVATAR} style={styles.avatar} resizeMode="cover" />
            <View style={styles.profileTexts}>
              <Text style={styles.profileName}>{user?.nickname ?? '-'}</Text>
              <Text style={styles.profileAccount}>{connectedLabel}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.accountBtn}
            activeOpacity={0.7}
            onPress={() => {
              // TODO: 계정관리 화면 라우트 생성 후 연결
              console.log('계정 관리 화면 — 라우트 미생성');
            }}
          >
            <Text style={styles.accountBtnText}>계정 관리</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionDivider} />

        <View style={styles.settingsList}>
          <View style={styles.sectionGroup}>
            <View style={styles.sectionTitle}>
              <Text style={styles.sectionTitleText}>알림</Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.listItemText}>푸쉬알림</Text>
              <TouchableOpacity
                accessibilityRole="switch"
                accessibilityState={{ checked: pushEnabled }}
                activeOpacity={0.8}
                onPress={handleTogglePush}
                style={[styles.toggle, pushEnabled ? styles.toggleOn : styles.toggleOff]}
              >
                <View style={[styles.toggleKnob, pushEnabled ? styles.toggleKnobOn : styles.toggleKnobOff]} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.sectionGroup}>
            <View style={styles.sectionTitle}>
              <Text style={styles.sectionTitleText}>지원</Text>
            </View>
            <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
              <Text style={styles.listItemText}>문의하기</Text>
              <Image source={ICON_ARROW_RIGHT} style={styles.listIcon} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.listItem}
              activeOpacity={0.7}
              onPress={() => router.push('/policy')}
            >
              <Text style={styles.listItemText}>약관 및 정책</Text>
              <Image source={ICON_ARROW_RIGHT} style={styles.listIcon} />
            </TouchableOpacity>
          </View>

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
  loadingContainer: { justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingBottom: layout.tabBarHeight },
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
  sectionDivider: { height: 8, backgroundColor: '#F4F5F7', width: '100%' },
  settingsList: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  sectionGroup: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '100%',
  },
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
  versionText: {
    fontSize: 11,
    fontFamily: 'Pretendard-Regular',
    color: colors.text.tertiary,
    lineHeight: 24,
  },
});
