import { MiniSafeProvider } from '@/context/miniSafe/MiniSafeContext';
import { ClaimProvider } from '@/context/utilityProvider/ClaimContextProvider';
import { UtilityProvider } from '@/context/utilityProvider/UtilityContext';

import React, { ReactNode } from 'react';

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ClaimProvider>
        <MiniSafeProvider>
          <UtilityProvider>
            {children}
          </UtilityProvider>
        </MiniSafeProvider>
    </ClaimProvider>
  );
}
