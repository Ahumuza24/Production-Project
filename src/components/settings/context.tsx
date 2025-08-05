import { createContext, useContext } from 'react';

// ----------------------------------------------------------------------

interface SettingsContextType {
  themeStretch: boolean;
}

const SettingsContext = createContext<SettingsContextType>({
  themeStretch: false,
});

export const useSettingsContext = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const value = {
    themeStretch: false,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};