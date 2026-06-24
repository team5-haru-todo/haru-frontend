import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { colors } from '@/src/constants/colors';

const ITEMS = [
  { key: 'terms', label: '(필수) 서비스 이용약관' },
  { key: 'privacy', label: '(필수) 개인정보처리방침' },
  { key: 'marketing', label: '마케팅 수신 동의' },
] as const;

export default function PolicyScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* NavBar: Arrow_left + 약관 및 정책 (centered abs) */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navLeft} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>약관 및 정책</Text>
      </View>

      {/* Content_Area: pt=32, px=20 */}
      <View style={styles.contentArea}>
        <View style={styles.termList}>
          {ITEMS.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.listItem}
              activeOpacity={0.7}
              onPress={() => router.push({ pathname: '/policy-detail', params: { type: item.key } })}
            >
              <Text style={styles.listItemText}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={24} color={colors.text.tertiary} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  // NavBar: h=56, border-bottom 2px #F7F7F7, px=20
  navBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: '#F7F7F7',
    backgroundColor: '#FFFFFF',
  },
  navLeft: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
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

  // Content_Area: flex-col, items-center, overflow-clip, pt=32, px=20
  contentArea: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 32,
    paddingHorizontal: 20,
    overflow: 'hidden',
  },

  // Group_Terms > Term_List: flex-col, items-start, w=full
  termList: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '100%',
  },

  // List_Item: h=44, gap=8, items-center
  listItem: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    width: '100%',
  },
  // Text: Regular 16px, lineHeight 24, text-primary, flex=1
  listItemText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Pretendard-Regular',
    color: colors.text.primary,
    lineHeight: 24,
  },
});
