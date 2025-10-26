import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
  info?: ErrorInfo;
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.setState({ error, info });
    if (import.meta.env.DEV) {
      console.error("ErrorBoundary caught an error:", error, info);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, info: undefined });
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="grid min-h-[60vh] place-items-center bg-slate-950 px-6 py-16 text-slate-100">
        <div className="max-w-lg space-y-6 rounded-3xl border border-white/10 bg-slate-900/60 p-10 text-center shadow-2xl shadow-primary/15">
          <div className="space-y-2">
            <div className="inline-flex rounded-full border border-primary/40 bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-primary">
              System Alert
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Something went sideways
            </h1>
            <p className="text-sm text-slate-300">
              An unexpected error prevented the Approver Console from rendering.
              Refresh to try again or contact the team if the issue persists.
            </p>
          </div>

          {import.meta.env.DEV && this.state.error ? (
            <pre className="max-h-48 overflow-auto rounded-2xl border border-white/10 bg-black/40 p-4 text-left text-xs leading-relaxed text-red-200">
              {this.state.error.stack ?? this.state.error.message}
            </pre>
          ) : null}

          <Button
            onClick={this.handleReset}
            className="w-full bg-linear-to-r from-primary via-indigo-500 to-primary font-semibold text-white"
          >
            Refresh console
          </Button>
        </div>
      </div>
    );
  }
}
