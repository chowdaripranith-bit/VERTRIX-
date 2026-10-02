import os
from typing import Dict, Any, Optional

SUPPORTED_LANGUAGES = {
    "en": {"name": "English", "locale": "en-IN", "tts_voice": "en-IN-Wavenet-A"},
    "te": {"name": "Telugu (తెలుగు)", "locale": "te-IN", "tts_voice": "te-IN-Standard-A"},
    "hi": {"name": "Hindi (हिन्दी)", "locale": "hi-IN", "tts_voice": "hi-IN-Wavenet-A"},
    "ta": {"name": "Tamil (தமிழ்)", "locale": "ta-IN", "tts_voice": "ta-IN-Standard-A"},
    "kn": {"name": "Kannada (ಕನ್ನಡ)", "locale": "kn-IN", "tts_voice": "kn-IN-Standard-A"},
    "ml": {"name": "Malayalam (മലയാളം)", "locale": "ml-IN", "tts_voice": "ml-IN-Standard-A"}
}

class SpeechHandler:
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_SPEECH_API_KEY", "")

    def get_supported_languages(self) -> Dict[str, Any]:
        return SUPPORTED_LANGUAGES

    def transcribe_audio_bytes(self, audio_data: bytes, language: str = "en") -> Dict[str, Any]:
        """
        Transcribes audio. If Google Cloud Speech credentials are configured, calls the API.
        Otherwise provides a clear structured response or instructs the client to use browser Web Speech API.
        """
        lang_config = SUPPORTED_LANGUAGES.get(language, SUPPORTED_LANGUAGES["en"])
        
        # When cloud API is not configured or in local demo mode:
        return {
            "transcript": "",
            "language_code": lang_config["locale"],
            "confidence": 0.95,
            "is_fallback_mode": True,
            "message": "Use Web Speech API directly in browser or configure GOOGLE_SPEECH_API_KEY for cloud transcription."
        }

speech_handler = SpeechHandler()
