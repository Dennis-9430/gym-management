import { createContext, useContext } from "react";

export type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextProps {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType) => void;
  hideToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const useToast = (): Omit<ToastContextProps, "toasts"> => {
  const context = useContext(ToastContext);
  if (!context) {
    return { showToast: () => {}, hideToast: () => {} };
  }
  return { showToast: context.showToast, hideToast: context.hideToast };
};
