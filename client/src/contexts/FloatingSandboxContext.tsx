/**
 * client/src/contexts/FloatingSandboxContext.tsx
 *
 * Global context for the floating AI Sandbox drawer.
 * Any component can call useSandbox().open() to pop the sandbox open.
 */
import { createContext, useContext, useState, ReactNode } from "react";

interface FloatingSandboxContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const FloatingSandboxContext = createContext<FloatingSandboxContextValue | null>(null);

export function FloatingSandboxProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <FloatingSandboxContext.Provider
      value={{
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        toggle: () => setIsOpen((v) => !v),
      }}
    >
      {children}
    </FloatingSandboxContext.Provider>
  );
}

export function useSandbox() {
  const ctx = useContext(FloatingSandboxContext);
  if (!ctx) throw new Error("useSandbox must be used within FloatingSandboxProvider");
  return ctx;
}
