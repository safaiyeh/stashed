import { AuthMessage } from '@stashed/shared';
import { authService } from '../lib/auth';
import { config } from '../config/env';

window.addEventListener('message', async (event) => {
  // Verify the origin
  if (event.origin !== config.webAppUrl) {
    return;
  }

  const message = event.data as AuthMessage;
  if (message.type === 'STASHED_AUTH') {
    try {
      await authService.setSession(message.session);
    } catch (error) {
      console.error('Failed to set session:', error);
    }
  }
}); 