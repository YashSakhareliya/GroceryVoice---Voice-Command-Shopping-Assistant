import express from 'express';
import { processVoiceCommand } from '../controllers/voiceController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/voice/command
// @desc    Process voice command and perform action
// @access  Private
router.post('/command', protect, processVoiceCommand);

export default router;
