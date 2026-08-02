interface ToastProps {
  message: string;
  visible: boolean;
  variant?: 'success' | 'info';
}

export function Toast({ message, visible, variant = 'success' }: ToastProps) {
  return (
    <div className={`toast toast-${variant} ${visible ? 'show' : ''}`} role="status">
      <i className={`ti ti-${variant === 'success' ? 'check' : 'send'}`} />
      {message}
    </div>
  );
}
