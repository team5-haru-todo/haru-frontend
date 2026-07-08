import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { colors } from '@/src/constants/colors';

const ICON_LINK_WARNING = require('../../../assets/images/Icon/Ic_LinkWarning.png');

interface AlreadyLinkedDialogProps {
  visible: boolean;
  onConfirm: () => void;
}

export function AlreadyLinkedDialog({ visible, onConfirm }: AlreadyLinkedDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onConfirm}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Image source={ICON_LINK_WARNING} style={styles.icon} resizeMode="contain" />
          <View style={styles.textGroup}>
            <Text style={styles.title}>잠깐, 이미 연동된 계정이 있어요!</Text>
            <Text style={styles.subtitle}>
              {'이미 가입된 계정이에요\n로그아웃 후 다시 로그인해보세요.'}
            </Text>
          </View>
          <TouchableOpacity style={styles.btnConfirm} activeOpacity={0.8} onPress={onConfirm}>
            <Text style={styles.btnConfirmText}>확인</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: colors.surface.default,
    borderRadius: 24,
    paddingTop: 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  icon: { width: 24, height: 24 },
  textGroup: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    color: colors.text.primary,
    lineHeight: 26,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
    color: colors.text.primary,
    lineHeight: 20,
    textAlign: 'center',
  },
  btnConfirm: {
    width: '100%',
    height: 54,
    borderRadius: 12,
    backgroundColor: colors.primary.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnConfirmText: {
    fontSize: 16,
    fontFamily: 'Pretendard-Bold',
    color: '#FFFFFF',
  },
});
