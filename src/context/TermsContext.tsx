import { createContext, useContext, useState, ReactNode } from 'react';

type TermsKey = 'service' | 'privacy' | 'marketing';

type TermsState = {
  service: boolean;
  privacy: boolean;
  marketing: boolean;
};

type TermsContextType = {
  agreed: TermsState;
  setAgreed: (key: TermsKey, value: boolean) => void;
  toggleAll: () => void;
  allChecked: boolean;
  requiredChecked: boolean;
};

const TermsContext = createContext<TermsContextType | undefined>(undefined);

export function TermsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TermsState>({
    service: false,
    privacy: false,
    marketing: false,
  });

  const setAgreed = (key: TermsKey, value: boolean) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const allChecked = state.service && state.privacy && state.marketing;
  const requiredChecked = state.service && state.privacy;

  const toggleAll = () => {
    const next = !allChecked;
    setState({ service: next, privacy: next, marketing: next });
  };

  return (
    <TermsContext.Provider value={{ agreed: state, setAgreed, toggleAll, allChecked, requiredChecked }}>
      {children}
    </TermsContext.Provider>
  );
}

export function useTerms() {
  const ctx = useContext(TermsContext);
  if (!ctx) throw new Error('useTerms must be used within TermsProvider');
  return ctx;
}