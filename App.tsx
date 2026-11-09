import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PersistGate } from 'redux-persist/integration/react';
import { AppToast, EmptyState } from '@/components/feedback';
import { ErrorBoundary } from '@/components/feedback';
import { Splash } from '@/components/feedback';
import { AppNavigation } from '@/Navigation/AppNavigation';
import { persistor, store } from '@/store/store';
import { DatabaseProvider } from '@/db/DatabaseProvider';

const styles = StyleSheet.create({ root: { flex: 1 } });

const App = (): ReactNode => (
  <GestureHandlerRootView style={styles.root}>
    <Provider store={store}>
      <DatabaseProvider
        fallback={<Splash />}
        renderError={(error) => <EmptyState title="Database error" message={error.message} />}
      >
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
  </GestureHandlerRootView>
);

export default App;
