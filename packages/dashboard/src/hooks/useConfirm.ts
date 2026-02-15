import { useState, useCallback } from 'react';

interface ConfirmState {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  variant: 'danger' | 'default';
  onConfirm: () => void;
}

const defaultState: ConfirmState = {
  open: false,
  title: 'Confirm',
  message: '',
  confirmLabel: 'Confirm',
  variant: 'default',
  onConfirm: () => {},
};

export function useConfirm() {
  const [state, setState] = useState<ConfirmState>(defaultState);

  const confirm = useCallback(
    (opts: { title?: string; message: string; confirmLabel?: string; variant?: 'danger' | 'default' }): Promise<boolean> => {
      return new Promise((resolve) => {
        setState({
          open: true,
          title: opts.title || 'Confirm',
          message: opts.message,
          confirmLabel: opts.confirmLabel || 'Confirm',
          variant: opts.variant || 'default',
          onConfirm: () => {
            setState(defaultState);
            resolve(true);
          },
        });
      });
    },
    []
  );

  const cancel = useCallback(() => {
    setState(defaultState);
  }, []);

  return {
    confirmState: state,
    confirm,
    cancelConfirm: cancel,
  };
}
