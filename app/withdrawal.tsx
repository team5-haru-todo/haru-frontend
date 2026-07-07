import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  TextInput,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';

import { colors } from '@/src/constants/colors';
import { StatusBarSpacer } from '@/src/components/common/StatusBarSpacer';
import { HomeIndicatorSpacer } from '@/src/components/common/HomeIndicatorSpacer';
import { ConfirmDialog } from '@/src/components/common/ConfirmDialog';
import { withdraw } from '@/src/api/user';

const ICON_ARROW_LEFT = require('../assets/images/Icon/Arrow_left.png');
const ICON_CHECKBOX_CHECKED = require('../assets/images/Ic_Checkboxe.png');

const REASON_OPTIONS = [
  { key: 'daily_input_annoying', label: '할 일을 매일 입력하는 게 귀찮아요' },
  { key: 'midnight_reset_inconvenient', label: '자정에 사라지는 기능이 불편해요' },
  { key: 'no_desired_feature', label: '원하는 기능이 없어요' },
  { key: 'too_many_notifications', label: '알림이 너무 많거나 불편해요' },
  { key: 'app_too_slow', label: '앱이 너무 느려요' },
] as const;

function Checkbox({ checked }: { checked: boolean }) {
  if (checked) {
    return <Image source={ICON_CHECKBOX_CHECKED} style={styles.checkboxIcon} />;
  }
  return <View style={styles.checkboxUnchecked} />;
}

export default function WithdrawalScreen() {
  const [step, setStep] = useState<'reason' | 'complete'>('reason');
  const [selectedReasons, setSelectedReasons] = useState<Set<string>>(new Set());
  const [etcChecked, setEtcChecked] = useState(false);
  const [etcText, setEtcText] = useState('');
  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);

  const toggleReason = (key: string) => {
    setSelectedReasons((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/account-management');
    }
  };

  const handleKeepUsing = () => {
    handleBack();
  };

  const handleConfirmWithdraw = async () => {
    try {
      const reasons: string[] = REASON_OPTIONS.filter((option) =>
        selectedReasons.has(option.key)
      ).map((option) => option.label);
      if (etcChecked) {
        reasons.push('기타');
      }
      await withdraw({
        reasons,
        etcReason: etcChecked && etcText.trim().length > 0 ? etcText.trim() : undefined,
      });
      setConfirmDialogVisible(false);
      setStep('complete');
    } catch (error) {
      console.error('회원 탈퇴 실패:', error);
      setConfirmDialogVisible(false);
    }
  };

  const handleFinish = async () => {
    if (Platform.OS !== 'web') {
      await SecureStore.deleteItemAsync('authToken');
    }
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <StatusBarSpacer />

      {/* NavBar: Arrow_left + 회원 탈퇴 (centered abs) */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={handleBack} style={styles.navLeft} activeOpacity={0.7}>
          <Image source={ICON_ARROW_LEFT} style={styles.icon} />
        </TouchableOpacity>
        <Text style={styles.navTitle} pointerEvents="none">회원 탈퇴</Text>
      </View>

      {step === 'reason' ? (
        <>
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.contentArea}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>탈퇴하는 이유를 알려주세요 (중복 선택 가능)</Text>

            <View style={styles.checkList}>
              {REASON_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={styles.checkItem}
                  activeOpacity={0.7}
                  onPress={() => toggleReason(option.key)}
                >
                  <Checkbox checked={selectedReasons.has(option.key)} />
                  <Text style={styles.checkItemText}>{option.label}</Text>
                </TouchableOpacity>
              ))}

              <View style={styles.checkItemEtcWrapper}>
                <TouchableOpacity
                  style={styles.checkItemEtc}
                  activeOpacity={0.7}
                  onPress={() => setEtcChecked((prev) => !prev)}
                >
                  <Checkbox checked={etcChecked} />
                  <Text style={styles.checkItemText}>기타</Text>
                </TouchableOpacity>
                <View style={styles.inputField}>
                  <TextInput
                    style={styles.inputText}
                    placeholder="이유를 입력해주세요."
                    placeholderTextColor={colors.text.placeholder}
                    value={etcText}
                    onChangeText={setEtcText}
                    onFocus={() => setEtcChecked(true)}
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.btnButtons}>
            <TouchableOpacity
              style={styles.btnNext}
              activeOpacity={0.7}
              onPress={() => setConfirmDialogVisible(true)}
            >
              <Text style={styles.btnNextText}>탈퇴하기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnCancel} activeOpacity={0.7} onPress={handleKeepUsing}>
              <Text style={styles.btnCancelText}>계속 이용하기</Text>
            </TouchableOpacity>
          </View>
          <HomeIndicatorSpacer />

          <ConfirmDialog
            visible={confirmDialogVisible}
            title="회원 탈퇴"
            description="정말 탈퇴하시겠습니까?"
            onCancel={() => setConfirmDialogVisible(false)}
            onConfirm={handleConfirmWithdraw}
          />
        </>
      ) : (
        <>
          <View style={styles.completeContentArea}>
            <View style={styles.centerContent}>
              <Text style={styles.completeTitle}>탈퇴가 완료되었습니다</Text>
              <View>
                <Text style={styles.completeBody}>하루한개와 함께 쌓아온 매일의 노력이</Text>
                <Text style={styles.completeBody}>당신의 새로운 시작에 든든한 밑거름이 되길 바랄게요</Text>
              </View>
            </View>
          </View>

          <View style={styles.btnWrapper}>
            <TouchableOpacity style={styles.btnConfirm} activeOpacity={0.7} onPress={handleFinish}>
              <Text style={styles.btnConfirmText}>나중에 다시 만나요!</Text>
            </TouchableOpacity>
          </View>
          <HomeIndicatorSpacer />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  // NavBar: h=56, border-bottom 2px #F7F7F7, px=20
  navBar: {
    position: 'relative',
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: '#F7F7F7',
    backgroundColor: '#FFFFFF',
  },
  navLeft: {
    width: 44,
    height: 44,
    marginLeft: -10,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  icon: { width: 24, height: 24, resizeMode: 'contain' },

  // Content_Area: px20 py24 gap24
  scrollArea: { flex: 1 },
  contentArea: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 24,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Pretendard-Bold',
    color: colors.text.primary,
    lineHeight: 32,
    letterSpacing: -1,
  },

  // Check_List: px12
  checkList: {
    paddingHorizontal: 12,
    width: '100%',
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  checkItemText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Pretendard-Regular',
    color: colors.text.primary,
    lineHeight: 24,
  },
  checkboxIcon: { width: 20, height: 20, resizeMode: 'contain' },
  checkboxUnchecked: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.text.placeholder,
    backgroundColor: colors.surface.default,
  },

  // Check_Item_etc + Input_Field: gap12, py16
  checkItemEtcWrapper: {
    flexDirection: 'column',
    gap: 12,
    paddingVertical: 16,
    width: '100%',
  },
  checkItemEtc: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inputField: {
    backgroundColor: '#F4F5F7',
    borderRadius: 16,
    paddingLeft: 32,
    paddingRight: 16,
    paddingVertical: 10,
    width: '100%',
  },
  inputText: {
    fontSize: 16,
    fontFamily: 'Pretendard-Regular',
    color: colors.text.primary,
    lineHeight: 24,
    padding: 0,
  },

  // Btn_Buttons: px12 gap12, width=350(contentWidth), self-centered
  btnButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 12,
    alignSelf: 'center',
    width: 350,
  },
  btnNext: {
    flex: 1,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#F4F5F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnNextText: {
    fontSize: 16,
    fontFamily: 'Pretendard-Bold',
    color: colors.text.tertiary,
    lineHeight: 24,
  },
  btnCancel: {
    flex: 1,
    height: 54,
    borderRadius: 12,
    backgroundColor: colors.primary.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancelText: {
    fontSize: 16,
    fontFamily: 'Pretendard-Bold',
    color: '#FFFFFF',
    lineHeight: 24,
  },

  // Complete screen (SCR-006_3)
  completeContentArea: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    padding: 10,
    width: '100%',
  },

  centerContent: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 20,
    width: '100%',
  },
  completeTitle: {
    fontSize: 24,
    fontFamily: 'Pretendard-Bold',
    color: colors.text.primary,
    lineHeight: 32,
    letterSpacing: -1,
    textAlign: 'center',
  },
  completeBody: {
    fontSize: 16,
    fontFamily: 'Pretendard-Regular',
    color: colors.text.secondary,
    lineHeight: 24,
    textAlign: 'center',
  },

  // Btn_Wrapper
  btnWrapper: {
    paddingHorizontal: 20,
    width: '100%',
  },
  btnConfirm: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.primary.default,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  btnConfirmText: {
    fontSize: 16,
    fontFamily: 'Pretendard-Bold',
    color: '#FFFFFF',
    lineHeight: 24,
  },
});