// screens/HomeScreen.tsx

import React, { useEffect, useState } from 'react';
import { View, Button, Text, StyleSheet, Alert } from 'react-native';
import { VoiceService } from '../services/VoiceService';
import { requestMicrophonePermission } from '../services/PermissionService';

export default function HomeScreen() {
  const [recognizedText, setRecognizedText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // 初始化語音服務
  useEffect(() => {
    VoiceService.init(handleVoiceResult);

    return () => {
      VoiceService.destroy();
    };
  }, []);

  // 接收辨識文字
  const handleVoiceResult = (text: string) => {
    setRecognizedText(text);
    if (text.includes('幫我記住')) {
      setIsRecording(true);
      // TODO: 這裡會啟動錄音模組
    }
  };

  // 手動啟動語音辨識
  const handleStart = async () => {
    const granted = await requestMicrophonePermission();
    if (!granted) {
      Alert.alert('無法啟動語音', '請允許麥克風權限');
      return;
    }

    setIsListening(true);
    await VoiceService.startListening();
  };

  const handleStop = async () => {
    setIsListening(false);
    await VoiceService.stopListening();
  };


  return (
    <View style={styles.container}>
      <Text>辨識結果：{recognizedText}</Text>
      <Text>{isRecording ? '🎙️ 正在錄音中...' : '尚未開始錄音'}</Text>

      <View style={styles.buttonGroup}>
        <Button title="開始聆聽" onPress={handleStart} disabled={isListening} />
        <Button title="停止聆聽" onPress={handleStop} disabled={!isListening} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  buttonGroup: { marginTop: 20, flexDirection: 'row', justifyContent: 'space-around' },
});
