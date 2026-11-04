import type { ReactNode } from 'react';
import { View } from 'react-native';
import { AppText } from '@/components/brand/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { useAppDispatch } from '@/store/hooks';
import { signIn } from '@/store/slices/authSlice';
import { colors } from '@/theme/colors';
import { styles } from './style';

/** EXAMPLE: delete or replace. A stub login: it signs in with a placeholder token. */
export const LoginScreen = (): ReactNode => {
  const dispatch = useAppDispatch();

  const handleSignIn = (): void => {
    // TODO: call ENDPOINTS.auth.login with apiRequest, then dispatch signIn(result.accessToken).
    void dispatch(signIn('placeholder-token'));
  };

  return (
    <View style={styles.root}>
      <AppText variant="heading">Sign in</AppText>
      <AppText variant="body" color={colors.inkMuted}>
        Stub screen. Replace it with the real login form.
      </AppText>
      <AppButton label="Sign in" onPress={handleSignIn} />
    </View>
  );
};
