import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

import type { TaskResponse } from '@/src/api/task';
import { colors, layout, radius, typography } from '@/src/constants';
import { formatRelativeDays } from '@/src/lib/date';

const pinIcon = require('@/assets/images/memo/pin-icon.png');
const pinFilledIcon = require('@/assets/images/memo/pin-filled-icon.png');
const trashIcon = require('@/assets/images/memo/trash-icon.png');

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
  // 진입 시 "밀 수 있다"를 알리는 1회성 프리뷰(HARU-38). 목록의 첫 카드에만 true로 준다.
  showSlidePreview?: boolean;
  onSlidePreviewEnd?: () => void;
};

// [프리뷰 구현 근거] Swipeable에는 "부분 열기" API가 없다(공개 메서드는 close/openLeft/
// openRight/reset뿐). 다만 openRight()가 여는 거리는 고정값이 아니라 renderRightActions가
// 실제로 차지한 너비다 — 라이브러리의 rightActions 컨테이너가 row-reverse라(Swipeable.js의
// styles.rightActions) 패널 뒤 마커 View의 x가 rowWidth - 패널너비가 되고, rightWidth =
// rowWidth - rightOffset = 패널너비로 계산된다. 그래서 프리뷰 동안만 패널을 좁게 감싸면
// 딱 그만큼만 열린다. 별도 목업 레이어 없이 실제 컴포넌트의 애니메이션·이징을 그대로 쓰므로
// 손으로 민 것과 움직임이 완전히 같다.
// 단, 이는 공개 API가 아닌 내부 레이아웃 동작에 의존한다. RNGH 업그레이드 후 프리뷰 폭이
// 이상하면 이 부분부터 확인할 것(검증 버전: 2.28.0).
// 카드 너비 대비 노출 비율. 디자인 요청값(30%)을 그대로 따른다.
// [확인된 제약] 액션 영역은 paddingLeft 8 + 핀 74 + gap 8 + 삭제 74 = 164px인데,
// 30%(390 화면에서 약 111px)면 핀만 온전히 보이고 삭제(휴지통) 아이콘은 가려진다.
// 두 버튼을 다 보이게 하려면 약 0.44가 필요하다(= 사실상 일반 스와이프와 같은 상태).
// 비율 재논의가 되면 이 값만 바꾸면 된다.
const SLIDE_PREVIEW_RATIO = 0.3;
const PREVIEW_LAYOUT_DELAY = 300; // 좁힌 패널의 onLayout이 반영될 시간 + 진입 직후 한 박자
const PREVIEW_HOLD = 1400; // 열린 상태를 유지하는 시간
const PREVIEW_RESTORE_DELAY = 400; // close 애니메이션이 끝난 뒤 패널 너비를 원래대로 되돌린다

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
  showSlidePreview = false,
  onSlidePreviewEnd,
}: MemoCardProps) {
  const swipeableRef = useRef<Swipeable>(null);
  const isChallengeDisabled = memo.completedToday;
  // 카드 실제 너비. 기기 폭을 하드코딩하지 않기 위해 onLayout으로 잰다.
  const [rowWidth, setRowWidth] = useState(0);
  // null이 아니면 프리뷰 진행 중 — 액션 패널을 이 너비로 잘라 openRight() 폭을 제한한다.
  const [previewWidth, setPreviewWidth] = useState<number | null>(null);
  // 종료 콜백은 ref로 들고 있는다. effect 의존성에 넣으면 부모가 인라인 함수를 넘길 때마다
  // 프리뷰가 다시 시작될 수 있다.
  const previewEndRef = useRef(onSlidePreviewEnd);
  previewEndRef.current = onSlidePreviewEnd;

  useEffect(() => {
    if (!showSlidePreview || rowWidth === 0) {
      return;
    }
    setPreviewWidth(Math.round(rowWidth * SLIDE_PREVIEW_RATIO));
    const openAt = PREVIEW_LAYOUT_DELAY;
    const closeAt = openAt + PREVIEW_HOLD;
    const restoreAt = closeAt + PREVIEW_RESTORE_DELAY;
    const timers = [
      setTimeout(() => swipeableRef.current?.openRight(), openAt),
      setTimeout(() => swipeableRef.current?.close(), closeAt),
      setTimeout(() => {
        // 패널 너비를 되돌려야 이후 손으로 미는 스와이프가 원래대로 끝까지 열린다.
        setPreviewWidth(null);
        previewEndRef.current?.();
      }, restoreAt),
    ];
    return () => timers.forEach(clearTimeout);
  }, [showSlidePreview, rowWidth]);

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
        <View
          style={[
            styles.swipeActions,
            previewWidth != null && styles.swipeActionsPreview,
            previewWidth != null && { width: previewWidth },
          ]}>
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
        onLayout={(event) => setRowWidth(event.nativeEvent.layout.width)}
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
          <Text style={styles.challengeButtonLabel}>시작</Text>
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
  // 프리뷰 중에만 적용 — 패널을 좁게 잘라 openRight()가 여는 폭을 제한한다(상단 주석 참고).
  swipeActionsPreview: {
    overflow: 'hidden',
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
