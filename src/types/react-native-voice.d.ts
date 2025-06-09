declare module 'react-native-voice' {
  export type SpeechStartEvent = { error?: boolean; };
  export type SpeechRecognizedEvent = { isFinal?: boolean; };
  export type SpeechEndEvent = { error?: boolean; };
  export type SpeechErrorEvent = { error?: { code?: string; message?: string; }; };
  export type SpeechResultsEvent = { value?: string[]; };
  export type SpeechVolumeChangeEvent = { value?: number; };

  export interface VoiceModule {
    isAvailable(): Promise<boolean>;
    start(locale: string): Promise<void>;
    stop(): Promise<void>;
    cancel(): Promise<void>;
    destroy(): Promise<void>;
    removeAllListeners(): void;
    isRecognizing(): Promise<boolean>;
    getSpeechRecognitionServices(): Promise<string[]>;

    onSpeechStart?: (e: SpeechStartEvent) => void;
    onSpeechRecognized?: (e: SpeechRecognizedEvent) => void;
    onSpeechEnd?: (e: SpeechEndEvent) => void;
    onSpeechError?: (e: SpeechErrorEvent) => void;
    onSpeechResults?: (e: SpeechResultsEvent) => void;
    onSpeechPartialResults?: (e: SpeechResultsEvent) => void;
    onSpeechVolumeChanged?: (e: SpeechVolumeChangeEvent) => void;
  }

  const Voice: VoiceModule;
  export default Voice;
}
