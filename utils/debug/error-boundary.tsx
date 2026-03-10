import React from 'react';
import { reportReactRenderError } from './client';

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
};

export class DebugErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    reportReactRenderError(error, errorInfo.componentStack || undefined);
  }

  public render(): React.ReactNode {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}
