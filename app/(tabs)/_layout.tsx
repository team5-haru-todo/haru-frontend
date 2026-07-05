import { Tabs } from 'expo-router';
import React from 'react';
import { Image, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HapticTab } from '@/components/haptic-tab';
import { colors } from '@/src/constants/colors';
import { layout } from '@/src/constants/layout';

const ICON_HOME_ACTIVE = require('../../assets/images/Icon/Tab_Home_Active.png');
const ICON_HOME_INACTIVE = require('../../assets/images/Icon/Tab_Home_Inactive.png');
const ICON_CALENDAR_ACTIVE = require('../../assets/images/Icon/Tab_Calendar_Active.png');
const ICON_CALENDAR_INACTIVE = require('../../assets/images/Icon/Tab_Calendar_Inactive.png');
const ICON_MYPAGE_ACTIVE = require('../../assets/images/Icon/Tab_Mypage_Active.png');
const ICON_MYPAGE_INACTIVE = require('../../assets/images/Icon/Tab_Mypage_Inactive.png');

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  // iOS는 기존 디자인 그대로 유지한다. Android는 기기별 시스템 네비게이션 바 높이(insets.bottom)를
  // 반영해, 고정 25px보다 실제 시스템 바가 큰 기기에서 라벨이 가려지지 않게 한다.
  const basePaddingBottom = 25;
  const tabBarPaddingBottom =
    Platform.OS === 'android' ? Math.max(insets.bottom, basePaddingBottom) : basePaddingBottom;
  // paddingBottom이 늘어난 만큼 height도 같이 늘려, 아이콘/라벨이 들어갈 상단 영역이 눌리지 않게 한다.
  const tabBarHeight = layout.tabBarHeight + Math.max(tabBarPaddingBottom - basePaddingBottom, 0);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary.default,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: colors.button.disabled,
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingTop: 7,
          paddingBottom: tabBarPaddingBottom,
          paddingHorizontal: 24,
          position: 'absolute',
        },
        tabBarItemStyle: {
          width: 56,
          height: 56,
          justifyContent: 'flex-start',
          paddingTop: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'Pretendard-Regular',
          lineHeight: 14,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ focused }) => (
            <Image
              source={focused ? ICON_HOME_ACTIVE : ICON_HOME_INACTIVE}
              style={{ width: 24, height: 24, resizeMode: 'contain' }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: '캘린더',
          tabBarIcon: ({ focused }) => (
            <Image
              source={focused ? ICON_CALENDAR_ACTIVE : ICON_CALENDAR_INACTIVE}
              style={{ width: 24, height: 24, resizeMode: 'contain' }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="mypage"
        options={{
          title: '마이페이지',
          tabBarIcon: ({ focused }) => (
            <Image
              source={focused ? ICON_MYPAGE_ACTIVE : ICON_MYPAGE_INACTIVE}
              style={{ width: 24, height: 24, resizeMode: 'contain' }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
