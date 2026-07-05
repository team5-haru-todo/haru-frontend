import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useToastStore } from '@/src/store/toastStore';
import { colors, radius, typography } from '@/src/constants';

const VISIBLE_MS = 3000;
const FADE_IN_MS = 120;
const FADE_OUT_MS = 400;

export function Toast() {
  const insets = useSafeAreaInsets();
  const seq = useToastStore((state) => state.seq);
  const visible = useToastStore((state) => state.visible);
  const message = useToastStore((state) => state.message);
  const hide = useToastStore((state) => state.hide);
  const opacity = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!visible) {
      return;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    opacity.stopAnimation();
    opacity.setValue(0);

    Animated.timing(opacity, {
      toValue: 1,
      duration: FADE_IN_MS,
      useNativeDriver: true,
    }).start();

    const currentSeq = seq;
    timeoutRef.current = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_OUT_MS,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished && useToastStore.getState().seq === currentSeq) {
          hide();
        }
      });
    }, VISIBLE_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      opacity.stopAnimation();
    };
  }, [seq, visible, opacity, hide]);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[styles.wrapper, { bottom: insets.bottom + 106, opacity }]}
      pointerEvents="none">
      <LinearGradient
        colors={['#52565F', '#8A8E99']}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={styles.toast}>
        <View style={styles.checkIcon}>
          <Ionicons name="checkmark" size={14} color={colors.surface.default} />
        </View>
        <Text style={styles.label}>{message}</Text>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
    elevation: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: radius.button,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.primary.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.b4BodySm,
    color: colors.surface.default,
  },
});
