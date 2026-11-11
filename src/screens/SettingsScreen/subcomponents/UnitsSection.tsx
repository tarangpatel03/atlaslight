import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Chip } from '@/components/inputs';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectUnits, setUnits } from '@/store/slices';
import { space } from '@/theme/layout';
import { SettingsSection } from './SettingsSection';

/** Kilometres or miles, used by Stats and the journey lists. */
export const UnitsSection = (): ReactNode => {
  const dispatch = useAppDispatch();
  const units = useAppSelector(selectUnits);

  return (
    <SettingsSection title="Distance">
      <View style={styles.chips}>
        <Chip
          label="Kilometres"
          selected={units === 'km'}
          onPress={() => dispatch(setUnits('km'))}
        />
        <Chip label="Miles" selected={units === 'mi'} onPress={() => dispatch(setUnits('mi'))} />
      </View>
    </SettingsSection>
  );
};

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', gap: space[2] },
});
