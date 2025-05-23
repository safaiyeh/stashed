import { AuthMessage } from '@stashed/shared';
import { authService } from '../lib/auth';
import { config } from '../config/env';

// Listen for messages from the web app
window.addEventListener('message', async (event) => {
  // Verify the origin - allow both the configured URL and localhost for development
  const allowedOrigins = [
    config.webAppUrl,
    'http://localhost:3000',
    'https://localhost:3000'
  ];
  
  if (!allowedOrigins.includes(event.origin)) {
    console.warn('Received message from unauthorized origin:', event.origin);
    return;
  }

  const message = event.data as AuthMessage;
  if (message.type === 'STASHED_AUTH') {
    try {
      await authService.setSession(message.session);
      // Notify the popup that auth is complete
      chrome.runtime.sendMessage({ type: 'AUTH_COMPLETE' });
    } catch (error) {
      console.error('Failed to set session:', error);
    }
  }
});

// Check if we're on the auth callback page
if (window.location.pathname === '/auth/callback') {
  // Inject a script to get the session and send it to the extension
  const script = document.createElement('script');
  script.textContent = `
    // Get the session from the page's context
    const getSession = async () => {
      const { data: { session } } = await window.supabase.auth.getSession();
      if (session) {
        // Send the session to the content script
        window.postMessage({
          type: 'STASHED_AUTH',
          session: {
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: Date.now() + (session.expires_in * 1000)
          }
        }, '*');
      }
    };
    getSession();
  `;
  document.head.appendChild(script);
} 