import { Image } from 'expo-image';
import { useRef } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

import type { TaskResponse } from '@/src/api/task';
import { colors, layout, radius, typography } from '@/src/constants';

const pinIcon = require('@/assets/images/memo/pin-icon.png');
const pinFilledIcon = require('@/assets/images/memo/pin-filled-icon.png');
const trashIcon = require('@/assets/images/memo/trash-icon.png');

function formatRelativeDays(createdAt: string) {
  const createdTime = new Date(createdAt).getTime();
  if (Number.isNaN(createdTime)) {
    return '';
  }
  const days = Math.floor((Date.now() - createdTime) / (1000 * 60 * 60 * 24));
  return days <= 0 ? '오늘' : `${days}일 전`;
}

export type MemoCardProps = {
  memo: TaskResponse;
  isEditing: boolean;
  editText: string;
  onChangeEdit: (text: string) => void;
  onSubmitEdit: () => void;
  onStartEdit: (memo: TaskResponse) => void;
  onTogglePin: (memo: TaskResponse) => void;
  onRequestDelete: (id: number) => void;
  onChallenge: (memo: TaskResponse) => void;
  onLongPress?: () => void;
};

export function MemoCard({
  memo,
  isEditing,
  editText,
  onChangeEdit,
  onSubmitEdit,
  onStartEdit,
  onTogglePin,
  onRequestDelete,
  onChallenge,
  onLongPress,
}: MemoCardProps) {
  const swipeableRef = useRef<Swipeable>(null);
  const isChallengeDisabled = memo.completedToday;

  const handleTogglePinPress = () => {
    swipeableRef.current?.reset();
    onTogglePin(memo);
  };

  const handleRequestDeletePress = () => {
    swipeableRef.current?.reset();
    onRequestDelete(memo.id);
  };

  if (isEditing) {
    return (
      <TextInput
        style={styles.input}
        value={editText}
        onChangeText={onChangeEdit}
        onSubmitEditing={onSubmitEdit}
        onBlur={onSubmitEdit}
        returnKeyType="done"
        cursorColor={colors.primary.default}
        autoFocus
      />
    );
  }
  return (
    <Swipeable
      ref={swipeableRef}
      overshootRight={false}
      renderRightActions={() => (
        <View style={styles.swipeActions}>
          <Pressable style={styles.pinButton} onPress={handleTogglePinPress}>
            <Image
              source={memo.taskType === 'RECURRING' ? pinFilledIcon : pinIcon}
              style={styles.actionIcon}
              contentFit="contain"
            />
          </Pressable>
          <Pressable style={styles.deleteButton} onPress={handleRequestDeletePress}>
            <Image source={trashIcon} style={styles.actionIcon} contentFit="contain" />
          </Pressable>
        </View>
      )}>
      <Pressable
        style={styles.memoCard}
        onPress={isChallengeDisabled ? undefined : () => onStartEdit(memo)}
        onLongPress={onLongPress}>
        <View style={styles.memoCardContent}>
          <Text style={styles.memoCardTitle}>{memo.content}</Text>
          <Text style={styles.memoCardTime}>{formatRelativeDays(memo.createdAt)}</Text>
        </View>
        <Pressable
          style={[styles.challengeButton, isChallengeDisabled && styles.challengeButtonDisabled]}
          onPress={() => onChallenge(memo)}
          disabled={isChallengeDisabled}>
          <Text style={styles.challengeButtonLabel}>도전</Text>
        </Pressable>
      </Pressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  input: {
    width: '100%',
    height: layout.memoInputHeight,
    borderWidth: 1,
    borderColor: colors.primary.default,
    borderRadius: radius.button,
    backgroundColor: colors.surface.default,
    paddingHorizontal: 16,
    paddingVertical: 0,
    // lineHeight를 명시하면 iOS에서 캐럿은 fontSize(16) 기준으로 그려지는데 글자는
    // lineHeight(24) 줄 안에 배치돼 서로 어긋난다(텍스트가 아래로 처져 보임).
    // lineHeight는 빼고 폰트의 자연스러운 줄 높이를 쓰되, 세로 공간은 height로 유지한다.
    fontFamily: typography.b3BodyRegular.fontFamily,
    fontSize: typography.b3BodyRegular.fontSize,
    letterSpacing: typography.b3BodyRegular.letterSpacing,
    color: colors.text.primary,
    textAlignVertical: 'center', // Android 전용: 텍스트 세로 중앙
    includeFontPadding: false, // Android 전용: 폰트 여분 패딩 제거
  },
  memoCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.button,
    backgroundColor: colors.surface.default,
    paddingHorizontal: 14,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  memoCardContent: {
    flex: 1,
    gap: 2,
    padding: 10,
  },
  memoCardTitle: {
    ...typography.b2BodyMedium,
    color: colors.text.primary,
  },
  memoCardTime: {
    ...typography.c1Caption,
    color: colors.text.tertiary,
  },
  challengeButton: {
    borderRadius: radius.pill,
    backgroundColor: colors.primary.light,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  challengeButtonDisabled: {
    opacity: 0.5,
  },
  challengeButtonLabel: {
    ...typography.b4BodySm,
    color: colors.primary.default,
  },
  swipeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 8,
  },
  pinButton: {
    width: 74,
    height: 74,
    borderRadius: radius.button,
    backgroundColor: '#E8E9EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    width: 74,
    height: 74,
    borderRadius: radius.button,
    backgroundColor: '#FFDFDF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    width: 24,
    height: 24,
  },
});
