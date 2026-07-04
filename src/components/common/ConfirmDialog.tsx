import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  description: string;
  cancelLabel?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  description,
  cancelLabel = '취소',
  confirmLabel = '확인',
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.popover}>
          <View style={styles.top}>
            <View style={styles.content}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.description}>{description}</Text>
            </View>
          </View>
          <View style={styles.bottomAction}>
            <TouchableOpacity style={styles.action} activeOpacity={0.6} onPress={onCancel}>
              <View style={styles.separatorTop} />
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </TouchableOpacity>
            <View style={styles.verticalSeparator} />
            <TouchableOpacity style={styles.action} activeOpacity={0.6} onPress={onConfirm}>
              <View style={styles.separatorTop} />
              <Text style={styles.confirmText}>{confirmLabel}</Text>
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
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  popover: {
    width: 270,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    alignItems: 'center',
    overflow: 'hidden',
  },
  top: {
    width: 270,
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    overflow: 'hidden',
  },
  content: {
    width: '100%',
    alignItems: 'center',
    gap: 2,
  },
  title: {
    width: '100%',
    textAlign: 'center',
    fontSize: 17,
    fontFamily: 'Pretendard-SemiBold',
    color: '#000000',
    lineHeight: 22,
    letterSpacing: -0.408,
  },
  description: {
    width: '100%',
    textAlign: 'center',
    fontSize: 13,
    fontFamily: 'Pretendard-Regular',
    color: '#000000',
    lineHeight: 18,
    letterSpacing: -0.078,
  },
  bottomAction: {
    width: 270,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  action: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  separatorTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 0.5,
    backgroundColor: 'rgba(0,0,0,0.24)',
  },
  verticalSeparator: {
    width: 0.5,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(0,0,0,0.24)',
  },
  cancelText: {
    fontSize: 17,
    fontFamily: 'Pretendard-Regular',
    color: '#007AFF',
    lineHeight: 22,
    letterSpacing: -0.408,
    textAlign: 'center',
  },
  confirmText: {
    fontSize: 17,
    fontFamily: 'Pretendard-SemiBold',
    color: '#007AFF',
    lineHeight: 22,
    letterSpacing: -0.408,
    textAlign: 'center',
  },
});
