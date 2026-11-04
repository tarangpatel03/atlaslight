import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PersistGate } from 'redux-persist/integration/react';
import { queryClient } from '@/api/client/queryClient';
import { AppToast } from '@/components/feedback/AppToast';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { Splash } from '@/components/feedback/Splash';
import { AppNavigation } from '@/Navigation/AppNavigation';
import { restoreSession } from '@/store/slices/authSlice';
import { persistor, store } from '@/store/store';
import { DatabaseProvider } from '@/app/providers/DatabaseProvider';

const App = (): ReactNode => {
  // The stored token must be read before the first API request.
  useEffect(() => {
    void store.dispatch(restoreSession());
  }, []);

  return (
    <Provider store={store}>
      <DatabaseProvider fallback={<Splash />}>
        <PersistGate loading={<Splash />} persistor={persistor}>
          <SafeAreaProvider>
            <QueryClientProvider client={queryClient}>
              <ErrorBoundary>
                <AppNavigation />
              </ErrorBoundary>
              <AppToast />
            </QueryClientProvider>
          </SafeAreaProvider>
        </PersistGate>
      </DatabaseProvider>
    </Provider>
  );
};

export default App;
