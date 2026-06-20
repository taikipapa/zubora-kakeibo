import { Stack } from 'expo-router';
import { useEffect } from 'react';
import mobileAds from 'react-native-google-mobile-ads';

import { initDatabase } from '../db/client';
import { ThemeProvider } from '../theme/ThemeContext';

export default function RootLayout() {
  useEffect(() => {
    initDatabase().catch((error) => {
      console.error('Failed to initialize database', error);
    });
    mobileAds().initialize().catch(() => {
      // Ad SDK init failure is non-fatal — ads simply won't load
    });
  }, []);

  return (
    <ThemeProvider>
      <Stack />
    </ThemeProvider>
  );
}
