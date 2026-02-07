// useGoogleAuth.ts - Simplified version
import { useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import { Platform } from 'react-native';

export const useGoogleAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For web/development
 const redirectUri = Platform.select({
  ios: 'Spnd://oauth/google/callback',
  android: 'Spnd://oauth/google/callback',
});

  const [request, response, promptAsync] = Google.useAuthRequest({
    // clientId: GOOGLE_WEB_CLIENT_ID,
    redirectUri,
    scopes: ['openid', 'profile', 'email'],
  });

  return {
    // This will trigger the Google login
    promptGoogleLogin: async () => {
      if (!request) {
        throw new Error('Google auth not ready');
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const result = await promptAsync();
        return result;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    googleLoading: loading,
    googleError: error,
    googleDisabled: !request || loading,
  };
};