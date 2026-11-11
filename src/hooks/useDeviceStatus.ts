import { useIsFocused } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { getPermissionStatus, type PermissionStatus } from '@/services/permissions.service';
import { getStorageSizes, type StorageSizes } from '@/services/storageInfo.service';

interface DeviceStatus {
  sizes: StorageSizes | null;
  permissions: PermissionStatus | null;
  /** The storage sizes could not be read. */
  sizesFailed: boolean;
  /** Reads the storage sizes again, e.g. after everything was deleted. */
  reloadSizes: () => void;
}

/**
 * Storage sizes and permission status for Settings. Read again each time the screen comes into
 * focus, so coming back from the system settings page or adding photos shows fresh values.
 */
export const useDeviceStatus = (): DeviceStatus => {
  const focused = useIsFocused();
  const [sizes, setSizes] = useState<StorageSizes | null>(null);
  const [permissions, setPermissions] = useState<PermissionStatus | null>(null);
  const [sizesFailed, setSizesFailed] = useState(false);
  // Bumped to ask for another read without a focus change.
  const [reloadKey, setReloadKey] = useState(0);
  const reloadSizes = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    if (!focused) return;
    let cancelled = false;
    getStorageSizes()
      .then((next) => {
        if (cancelled) return;
        setSizes(next);
        setSizesFailed(false);
      })
      .catch(() => {
        if (!cancelled) setSizesFailed(true);
      });
    getPermissionStatus()
      .then((next) => {
        if (!cancelled) setPermissions(next);
      })
      .catch(() => {
        // Unknown status stays on "...": the shortcut to the system settings still works.
      });
    return () => {
      cancelled = true;
    };
  }, [focused, reloadKey]);

  return { sizes, permissions, sizesFailed, reloadSizes };
};
