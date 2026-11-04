import { Component, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/brand/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { colors } from '@/theme/colors';
import { space } from '@/theme/layout';

interface ErrorBoundaryState {
  failed: boolean;
}

/**
 * Safety net for rendering crashes: shows a message and a way back instead of a dead screen.
 * It has to be a class, because React only supports error boundaries as classes. Failed loads are
 * handled on each screen and never reach it.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true };
  }

  render(): ReactNode {
    if (!this.state.failed) return this.props.children;
    return (
      <View style={styles.root}>
        <AppText variant="title">Something went wrong</AppText>
        <AppText variant="body" color={colors.inkMuted}>
          The app hit a problem. You can try again.
        </AppText>
        <AppButton label="Try again" onPress={() => this.setState({ failed: false })} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[3],
    padding: space[6],
    backgroundColor: colors.bg,
  },
});
