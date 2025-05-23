import React from 'react';
import { config } from '../../config/env';

const LoginScreen: React.FC = () => {
  const handleLogin = () => {
    // Open the extension's login page in a new tab
    chrome.tabs.create({ 
      url: chrome.runtime.getURL('pages/login/index.html')
    });
    // Close the popup after redirecting
    window.close();
  };

  return (
    <div className="w-96 h-[400px] bg-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">Stashed</h1>
      </div>

      {/* Login Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Sign in to Stashed</h2>
          <p className="text-sm text-gray-600 mb-6">
            You need to sign in to save and sync your bookmarks across devices.
          </p>
        </div>

        <button
          onClick={handleLogin}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Sign in with Magic Link
        </button>

        <p className="text-xs text-gray-500 mt-4">
          We'll open a new tab to sign in securely
        </p>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-400">
          Powered by{' '}
          <a 
            href={config.webAppUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600"
          >
            Stashed
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginScreen; 