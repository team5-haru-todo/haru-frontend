import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { colors } from '@/src/constants/colors';

const POLICIES = [
  { title: '서비스 이용약관', updatedAt: '2025.01.01' },
  { title: '개인정보 처리방침', updatedAt: '2025.01.01' },
  { title: '위치기반 서비스 이용약관', updatedAt: '2025.01.01' },
  { title: '마케팅 정보 수신 동의', updatedAt: '2025.01.01' },
];

export default function PolicyScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* NavBar */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>약관 및 정책</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.list}>
          {POLICIES.map((item, i) => (
            <TouchableOpacity key={i} style={styles.listItem} activeOpacity={0.7}>
              <View style={styles.listItemLeft}>
                <Text style={styles.listItemTitle}>{item.title}</Text>
                <Text style={styles.listItemDate}>시행일 {item.updatedAt}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.text.tertiary} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingBottom: 40 },

  navBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: '#F7F7F7',
    backgroundColor: '#FFFFFF',
  },
  backBtn: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  navTitle: {
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    color: colors.text.primary,
    letterSpacing: -0.5,
    lineHeight: 26,
  },

  list: { flexDirection: 'column' },
  listItem: {
    height: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F5F7',
    backgroundColor: '#FFFFFF',
  },
  listItemLeft: { flexDirection: 'column', gap: 4 },
  listItemTitle: {
    fontSize: 16,
    fontFamily: 'Pretendard-Regular',
    color: colors.text.primary,
    lineHeight: 24,
  },
  listItemDate: {
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
    color: colors.text.tertiary,
    lineHeight: 16,
  },
});
