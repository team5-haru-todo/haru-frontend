import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, typography, layout } from '@/src/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Props = { isActive: boolean; onFinish: () => void };

export default function TutorialPage3({ onFinish }: Props) {
  return (
    <View style={[styles.container, { width: SCREEN_WIDTH }]}>
      <View style={styles.middleArea}>
        {/*
          TODO: 희원님의 주간 스트립 + 스트릭 뱃지 컴포넌트로 교체
          예: <WeekStrip /> <StreakBadge />
        */}
        <Text style={styles.placeholder}>주간 스트립 / 스트릭 뱃지 영역</Text>
      </View>

      <TouchableOpacity style={styles.cta} onPress={onFinish}>
        <Text style={styles.ctaLabel}>오늘의 할 일 등록하러 가기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'space-between' },
  middleArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholder: { ...typography.b3BodyRegular, color: colors.text.tertiary },
  cta: {
    margin: layout.margin,
    height: 56,
    borderRadius: 20,
    backgroundColor: colors.primary.default,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaLabel: { ...typography.b2BodyMedium, color: '#FFFFFF' },
});