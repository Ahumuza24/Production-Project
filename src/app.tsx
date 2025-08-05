import 'src/global.css';

import { useEffect } from 'react';

import { usePathname } from 'src/routes/hooks';

import { AuthProvider } from 'src/contexts/AuthContext';
import { ThemeProvider } from 'src/theme/theme-provider';
import { SettingsProvider } from 'src/components/settings';

type AppProps = {
  children: React.ReactNode;
};

export default function App({ children }: AppProps) {
  useScrollToTop();

  return (
    <AuthProvider>
      <SettingsProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

// ----------------------------------------------------------------------

function useScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
