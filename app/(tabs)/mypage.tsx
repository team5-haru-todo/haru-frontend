import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { StatusBar } from 'expo-status-bar';

import { colors } from '@/src/constants/colors';
import { layout } from '@/src/constants/layout';
import { StatusBarSpacer } from '@/src/components/common/StatusBarSpacer';
import { getMySettings, updateMySettings } from '@/src/api/user';
import { useUserStore } from '@/src/store/userStore';
import { registerForPushNotifications } from '@/src/services/pushNotifications';

const ICON_AVATAR = require('../../assets/images/Icon/Avatar.png');
const ICON_ARROW_RIGHT = require('../../assets/images/Icon/Arrow_Right_xs.png');
const SUPPORT_EMAIL = 'support@example.com';

export default function MyPageScreen() {
  const user = useUserStore((state) => state.user);
  const fetchUser = useUserStore((state) => state.fetchUser);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [pushUpdating, setPushUpdating] = useState(false);
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
    if (pushUpdating) return;

    // 끄기: 서버 설정만 갱신
    if (pushEnabled) {
      setPushEnabled(false);
      try {
        await updateMySettings(false);
      } catch (error) {
        console.error('푸시알림 설정 변경 실패:', error);
        setPushEnabled(true);
      }
      return;
    }

    // 켜기: 권한 요청 + 디바이스 토큰 등록까지 완료돼야 켜짐
    setPushUpdating(true);
    try {
      const registered = await registerForPushNotifications();
      if (!registered) {
        Alert.alert(
          '알림 권한이 필요해요',
          '설정 앱에서 하루한개의 알림 권한을 허용해 주세요.',
        );
        return;
      }
      setPushEnabled(true);
    } catch (error) {
      console.error('푸시 알림 등록 실패:', error);
      Alert.alert(
        '알림을 설정하지 못했어요',
        '원격 알림은 Expo Go가 아닌 Development Build에서 설정할 수 있어요.',
      );
    } finally {
      setPushUpdating(false);
    }
  };

  const handleContactPress = async () => {
    const subject = encodeURIComponent('[하루한개] 문의하기');
    const body = encodeURIComponent('문의 내용을 입력해주세요.\n\n');
    const mailUrl = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;

    try {
      await Linking.openURL(mailUrl);
    } catch (error) {
      console.error('문의 메일 작성 화면 열기 실패:', error);
      Alert.alert('메일 앱을 열 수 없어요', '기기에 메일 앱이 설정되어 있는지 확인해 주세요.');
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
            onPress={() => router.push('/account-management')}
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
                accessibilityState={{ checked: pushEnabled, disabled: pushUpdating }}
                activeOpacity={0.8}
                onPress={handleTogglePush}
                disabled={pushUpdating}
                style={[styles.toggle, pushEnabled ? styles.toggleOn : styles.toggleOff]}
              >
                {pushUpdating ? (
                  <ActivityIndicator size="small" color={colors.text.tertiary} style={styles.toggleSpinner} />
                ) : (
                  <View style={[styles.toggleKnob, pushEnabled ? styles.toggleKnobOn : styles.toggleKnobOff]} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.sectionGroup}>
            <View style={styles.sectionTitle}>
              <Text style={styles.sectionTitleText}>지원</Text>
            </View>
            <TouchableOpacity
              style={styles.listItem}
              activeOpacity={0.7}
              onPress={handleContactPress}
            >
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
  toggleSpinner: {
    position: 'absolute',
    top: 2,
    left: 12,
  },
  versionText: {
    fontSize: 11,
    fontFamily: 'Pretendard-Regular',
    color: colors.text.tertiary,
    lineHeight: 24,
  },
});
