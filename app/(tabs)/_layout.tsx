import { Tabs } from 'expo-router';
import React from 'react';
import { Image } from 'react-native';
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
          height: layout.tabBarHeight,
          paddingTop: 7,
          paddingBottom: 25,
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
