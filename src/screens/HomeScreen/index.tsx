import type { ReactNode } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { AppText } from '@/components/brand/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { TextField } from '@/components/inputs/TextField';
import { Screen } from '@/components/layout/Screen';
import { useExamples } from '@/hooks/useExamples';
import { signOut } from '@/store/slices/authSlice';
import { selectExampleSearch, setSearch } from '@/store/slices/exampleSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { colors } from '@/theme/colors';
import { showToast } from '@/utils/toast.util';
import { styles } from './style';

/**
 * EXAMPLE: delete or replace. Shows the whole pattern on one screen: UI state from Redux
 * (search), server state from a TanStack Query hook, loading/error/empty states, a toast.
 * The list needs the API's example module (GET /examples); without it the error state shows.
 */
export const HomeScreen = (): ReactNode => {
  const dispatch = useAppDispatch();
  const search = useAppSelector(selectExampleSearch);
  const { data, isPending, isError, refetch } = useExamples({ search });

  const handleSignOut = (): void => {
    void dispatch(signOut());
    showToast.info('Signed out');
  };

  const renderBody = (): ReactNode => {
    if (isPending) return <ActivityIndicator color={colors.amber} />;
    if (isError) {
      return (
        <EmptyState
          title="Could not load"
          message="Check the API address in .env and try again."
          actionLabel="Retry"
          onAction={() => void refetch()}
        />
      );
    }
    return (
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AppText variant="bodyStrong">{item.name}</AppText>}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={<EmptyState title="Nothing here yet" message="No items found." />}
        keyboardShouldPersistTaps="handled"
      />
    );
  };

  return (
    <Screen>
      <View style={styles.header}>
        <AppText variant="heading">Home</AppText>
        <TextField
          label="Search"
          value={search}
          onChangeText={(text) => dispatch(setSearch(text))}
          placeholder="Type to filter"
        />
      </View>
      <View style={styles.body}>{renderBody()}</View>
      <AppButton label="Sign out" onPress={handleSignOut} />
    </Screen>
  );
};
