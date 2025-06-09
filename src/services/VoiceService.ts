import Voice from 'react-native-voice';

class VoiceServiceClass {
  private onResultCallback: ((text: string) => void) | null = null;

  // 初始化並註冊事件
  init(onResult: (text: string) => void) {
    this.onResultCallback = onResult;

    Voice.onSpeechResults = this.handleSpeechResults;
    Voice.onSpeechError = this.handleSpeechError;
  }

  // 開始語音辨識
  async startListening(): Promise<void> {
    try {
      await Voice.start('zh-TW');
    } catch (e) {
      console.error('startListening error:', e);
    }
  }

  // 停止語音辨識
  async stopListening(): Promise<void> {
    try {
      await Voice.stop();
    } catch (e) {
      console.error('stopListening error:', e);
    }
  }

  // 結束所有事件與資源
  async destroy(): Promise<void> {
    try {
      await Voice.destroy();
      Voice.removeAllListeners();
    } catch (e) {
      console.error('destroy error:', e);
    }
  }

  // 辨識結果事件
  private handleSpeechResults = (event: { value?: string[]; }) => {
    const text = event.value?.[0] ?? '';
    this.onResultCallback?.(text);
  };

  // 錯誤事件
  private handleSpeechError = (event: { error?: { message?: string; }; }) => {
    console.error('Voice recognition error:', event.error?.message);
  };
}

export const VoiceService = new VoiceServiceClass();
