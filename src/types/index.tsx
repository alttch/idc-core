import { ReactNode } from "react";

export interface CustomButtonProps {
  className?: string;
  type?: "button" | "submit" | "reset";
  children?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
}

export interface ModalDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  onClick: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  children?: ReactNode;
}
