import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PersistGate } from 'redux-persist/integration/react';
import { AppToast } from '@/components/feedback/AppToast';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { Splash } from '@/components/feedback/Splash';
import { AppNavigation } from '@/Navigation/AppNavigation';
import { persistor, store } from '@/store/store';
import { DatabaseProvider } from '@/db/DatabaseProvider';

const App = (): ReactNode => (
  <Provider store={store}>
    <DatabaseProvider fallback={<Splash />}>
      <PersistGate loading={<Splash />} persistor={persistor}>
        <SafeAreaProvider>
          <ErrorBoundary>
            <AppNavigation />
          </ErrorBoundary>
          <AppToast />
        </SafeAreaProvider>
      </PersistGate>
    </DatabaseProvider>
  </Provider>
);

export default App;
