import { migrate } from 'drizzle-orm/op-sqlite/migrator';
import React, { type PropsWithChildren, type ReactNode, useEffect, useState } from 'react';

import { configureDatabase, db } from '@/db/client';
import migrations from '@/db/migrations/migrations';

type Status = { state: 'loading' } | { state: 'ready' } | { state: 'error'; error: Error };

type Props = PropsWithChildren<{
  /** Shown while pragmas + migrations run (keep the bootsplash visible instead if you prefer). */
  fallback?: ReactNode;
  /** Shown if migrations fail. */
  renderError?: (error: Error) => ReactNode;
}>;

/**
 * Gate that blocks the app until the database is configured and migrated.
 * Wrap it outside the navigator so no screen can query an unmigrated DB.
 */
export function DatabaseProvider({ children, fallback = null, renderError }: Props) {
  const [status, setStatus] = useState<Status>({ state: 'loading' });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await configureDatabase();
        await migrate(db, migrations);
        if (!cancelled) setStatus({ state: 'ready' });
      } catch (e) {
        if (!cancelled) {
          setStatus({ state: 'error', error: e instanceof Error ? e : new Error(String(e)) });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (status.state === 'loading') return <>{fallback}</>;
  if (status.state === 'error') return <>{renderError?.(status.error) ?? null}</>;
  return <>{children}</>;
}
