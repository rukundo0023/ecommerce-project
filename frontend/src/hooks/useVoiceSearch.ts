import { useEffect, useRef, useState } from "react";

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike extends ArrayLike<SpeechRecognitionAlternativeLike> {
  isFinal: boolean;
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionErrorEventLike {
  error: string;
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;
type SpeechWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

const getSpeechRecognition = () => {
  const speechWindow = window as SpeechWindow;
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
};

const errorMessage = (error: string) => {
  if (error === "not-allowed" || error === "service-not-allowed") {
    return "Microphone access was denied. Allow microphone access and try again.";
  }
  if (error === "no-speech") {
    return "No speech was detected. Try speaking again.";
  }
  if (error === "audio-capture") {
    return "No microphone was found. Connect a microphone and try again.";
  }
  return "Voice search could not start. Please try again.";
};

export function useVoiceSearch(
  onResult: (transcript: string) => void,
  onError: (message: string) => void
) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);
  const supported =
    typeof window !== "undefined" && Boolean(getSpeechRecognition());

  useEffect(() => {
    onResultRef.current = onResult;
    onErrorRef.current = onError;
  }, [onError, onResult]);

  useEffect(() => {
    return () => {
      const recognition = recognitionRef.current;
      if (recognition) {
        recognition.onend = null;
        recognition.stop();
      }
    };
  }, []);

  const stop = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const start = () => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = navigator.language || "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript.trim();
      if (transcript) onResultRef.current(transcript);
      else onErrorRef.current("No speech was recognized. Try again.");
    };
    recognition.onerror = (event) => {
      onErrorRef.current(errorMessage(event.error));
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      setListening(false);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch {
      recognitionRef.current = null;
      setListening(false);
      onErrorRef.current("Voice search could not start. Please try again.");
    }
  };

  return { listening, supported, start, stop };
}
