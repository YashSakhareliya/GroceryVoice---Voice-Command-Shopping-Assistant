import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, X } from 'lucide-react'

function VoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const recognitionRef = useRef(null)
  const silenceTimerRef = useRef(null)

  useEffect(() => {
    // Check if browser supports Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event) => {
        let interim = ''
        let final = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            final += transcriptPart + ' '
          } else {
            interim += transcriptPart
          }
        }

        if (final) {
          setTranscript(prev => prev + final)
          setInterimTranscript('')
          // Reset silence timer on new speech
          resetSilenceTimer()
        } else {
          setInterimTranscript(interim)
        }
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        if (event.error === 'no-speech') {
          // Don't stop on no-speech error, just reset timer
          resetSilenceTimer()
        }
      }

      recognitionRef.current.onend = () => {
        if (isListening) {
          // Restart if we're still supposed to be listening
          try {
            recognitionRef.current.start()
          } catch (e) {
            console.error('Error restarting recognition:', e)
          }
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current)
      }
    }
  }, [isListening])

  const resetSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
    }
    // Auto-stop after 3 seconds of silence
    silenceTimerRef.current = setTimeout(() => {
      if (isListening && transcript) {
        handleStopListening()
      }
    }, 3000)
  }

  const handleStartListening = () => {
    if (recognitionRef.current) {
      setTranscript('')
      setInterimTranscript('')
      setIsListening(true)
      try {
        recognitionRef.current.start()
        resetSilenceTimer()
      } catch (e) {
        console.error('Error starting recognition:', e)
      }
    }
  }

  const handleStopListening = () => {
    if (recognitionRef.current) {
      setIsListening(false)
      recognitionRef.current.stop()
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current)
      }
    }
  }

  const handleContinue = () => {
    handleStopListening()
    const finalTranscript = transcript + interimTranscript
    if (finalTranscript.trim()) {
      // For now, just log to console
      console.log('Voice Command:', finalTranscript.trim())
      // TODO: Send to backend
      // fetch('/api/voice-command', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ command: finalTranscript.trim() })
      // })
      
      // Reset and close
      setTranscript('')
      setInterimTranscript('')
      setIsOpen(false)
    }
  }

  const handleClose = () => {
    handleStopListening()
    setTranscript('')
    setInterimTranscript('')
    setIsOpen(false)
  }

  return (
    <>
      {/* Floating Voice Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-dark-green text-white p-4 rounded-full shadow-lg hover:bg-opacity-90 transition-all z-40 hover:scale-110"
        title="Voice Assistant"
      >
        <Mic size={24} />
      </button>

      {/* Voice Assistant Modal */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50">
          <div className="bg-white rounded-lg shadow-2xl w-80 overflow-hidden border border-gray-200">
            {/* Header */}
            <div className="bg-dark-green text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-semibold text-lg">Voice Assistant</h3>
              <button onClick={handleClose} className="hover:bg-white hover:bg-opacity-20 rounded p-1">
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Microphone Animation */}
              <div className="flex justify-center mb-6">
                <div className={`relative ${isListening ? 'animate-pulse' : ''}`}>
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
                    isListening ? 'bg-red-100' : 'bg-gray-100'
                  }`}>
                    {isListening ? (
                      <MicOff size={48} className="text-red-600" />
                    ) : (
                      <Mic size={48} className="text-gray-600" />
                    )}
                  </div>
                  {isListening && (
                    <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-red-600 font-semibold whitespace-nowrap">
                      Listening...
                    </span>
                  )}
                </div>
              </div>

              {/* Transcript Display */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 min-h-[120px] max-h-[200px] overflow-y-auto">
                {transcript || interimTranscript ? (
                  <p className="text-gray-800">
                    {transcript}
                    <span className="text-gray-400">{interimTranscript}</span>
                  </p>
                ) : (
                  <p className="text-gray-400 text-center">
                    Click the microphone to start speaking...
                  </p>
                )}
              </div>

              {/* Controls */}
              <div className="flex gap-3">
                {!isListening ? (
                  <button
                    onClick={handleStartListening}
                    className="flex-1 bg-dark-green text-white py-3 rounded-md font-semibold hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Mic size={18} />
                    Start Recording
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleStopListening}
                      className="flex-1 bg-red-600 text-white py-3 rounded-md font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <MicOff size={18} />
                      Stop
                    </button>
                    <button
                      onClick={handleContinue}
                      className="flex-1 bg-light-green text-white py-3 rounded-md font-semibold hover:bg-opacity-90 transition-colors"
                      disabled={!transcript && !interimTranscript}
                    >
                      Continue
                    </button>
                  </>
                )}
              </div>

              <p className="text-xs text-gray-500 mt-4 text-center">
                Speak clearly into your microphone. Recording will auto-stop after 3 seconds of silence.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default VoiceAssistant
