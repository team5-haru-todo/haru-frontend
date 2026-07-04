import React from 'react';
import { Modal, View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';

import { colors } from '@/src/constants/colors';

const ICON_LOGIN = require('../../../assets/images/Icon/Login_ic.png');

interface GuestLogoutDialogProps {
  visible: boolean;
  onLogout: () => void;
  onConnect: () => void;
}

export function GuestLogoutDialog({ visible, onLogout, onConnect }: GuestLogoutDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onConnect}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Image source={ICON_LOGIN} style={styles.icon} resizeMode="contain" />

          <View style={styles.textGroup}>
            <Text style={styles.title}>잠깐, 기록이 사라질 수 있어요!</Text>
            <View>
              <Text style={styles.description}>게스트 계정은 기록이 저장되지 않아요</Text>
              <Text style={styles.description}>소중한 데이터를 위해 계정을 연결해 주세요</Text>
            </View>
          </View>

          <View style={styles.row}>
            <TouchableOpacity style={styles.btnLogout} activeOpacity={0.7} onPress={onLogout}>
              <Text style={styles.btnLogoutText}>로그아웃</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnConnect} activeOpacity={0.7} onPress={onConnect}>
              <Text style={styles.btnConnectText}>계정 연결하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    width: '90%',
    maxWidth: 350,
    backgroundColor: colors.surface.default,
    borderRadius: 24,
    paddingTop: 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  icon: { width: 24, height: 24 },
  textGroup: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    color: colors.text.primary,
    letterSpacing: -0.5,
    lineHeight: 26,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
    color: colors.text.primary,
    lineHeight: 20,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  btnLogout: {
    flex: 1,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingHorizontal: 29,
  },
  btnLogoutText: {
    fontSize: 16,
    fontFamily: 'Pretendard-Bold',
    color: colors.text.tertiary,
    lineHeight: 24,
    textAlign: 'center',
  },
  btnConnect: {
    flex: 1,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingHorizontal: 29,
    backgroundColor: colors.primary.default,
  },
  btnConnectText: {
    fontSize: 16,
    fontFamily: 'Pretendard-Bold',
    color: colors.surface.default,
    lineHeight: 24,
    textAlign: 'center',
  },
});
