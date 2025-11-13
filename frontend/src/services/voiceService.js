import api from './api'

export const voiceService = {
  // Process voice command
  processCommand: async (text) => {
    const response = await api.post('/voice/command', { text })
    return response.data
  },
}
