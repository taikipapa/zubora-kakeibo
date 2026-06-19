import { Stack } from 'expo-router';
import { useEffect } from 'react';

import { initDatabase } from '../db/client';
import { ThemeProvider } from '../theme/ThemeContext';

export default function RootLayout() {
  useEffect(() => {
    initDatabase().catch((error) => {
      console.error('Failed to initialize database', error);
    });
  }, []);

  return (
    <ThemeProvider>
      <Stack />
    </ThemeProvider>
  );
}
