import React, { createContext, ReactNode, useContext, useState } from 'react';

interface SuccessContextType {
  success: string | null;
  setSuccess: (success: string | null) => void;
  clearSuccess: () => void;
}

const SuccessContext = createContext<SuccessContextType | undefined>(undefined);

export const SuccessProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [success, setSuccess] = useState<string | null>(null);

  const clearSuccess = () => setSuccess(null);

  return (
    <SuccessContext.Provider value={{ success, setSuccess, clearSuccess }}>
      {children}
    </SuccessContext.Provider>
  );
};

export const useSuccess = (): SuccessContextType => {
  const context = useContext(SuccessContext);
  if (context === undefined) {
    throw new Error('useSuccess must be used within a SuccessProvider');
  }
  return context;
};
