import { Image } from 'expo-image';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, typography } from '@/src/constants';

const trashIcon = require('@/assets/images/memo/trash-icon.png');

export type DeleteMemoModalProps = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteMemoModal({ visible, onCancel, onConfirm }: DeleteMemoModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modal}>
          <Image source={trashIcon} style={styles.actionIcon} contentFit="contain" />
          <View style={styles.modalTextGroup}>
            <Text style={styles.modalTitle}>이 메모를 삭제할까요?</Text>
            <Text style={styles.modalSubtitle}>삭제하면 다시 되돌릴 수 없어요</Text>
          </View>
          <View style={styles.modalButtons}>
            <Pressable style={styles.modalCancelButton} onPress={onCancel}>
              <Text style={styles.modalCancelLabel}>취소</Text>
            </Pressable>
            <Pressable style={styles.modalConfirmButton} onPress={onConfirm}>
              <Text style={styles.modalConfirmLabel}>삭제하기</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  actionIcon: {
    width: 24,
    height: 24,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    width: 291,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    borderRadius: radius.card,
    backgroundColor: colors.surface.default,
    paddingTop: 30,
    paddingBottom: 20,
    paddingHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  modalTextGroup: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  modalTitle: {
    ...typography.b1Subtitle,
    color: colors.text.primary,
    textAlign: 'center',
  },
  modalSubtitle: {
    ...typography.b4BodySm,
    color: colors.text.primary,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  modalCancelLabel: {
    ...typography.b2BodyBold,
    color: colors.text.tertiary,
  },
  modalConfirmButton: {
    flex: 1,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.primary.default,
  },
  modalConfirmLabel: {
    ...typography.b2BodyBold,
    color: colors.surface.default,
  },
});
