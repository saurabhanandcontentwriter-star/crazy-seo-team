import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

export default class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Crazy SEO Team runtime error:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <main className="min-h-screen bg-white px-6 py-16 text-slate-900">
          <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600">Crazy SEO Team</p>
            <h1 className="mt-3 text-3xl font-black">Website runtime error</h1>
            <p className="mt-3 text-slate-600">The deployment is live, but the browser hit an application error. Refresh after the latest fix.</p>
            <pre className="mt-6 overflow-auto rounded-2xl bg-slate-950 p-4 text-sm text-white">{this.state.error.message}</pre>
            <button
              className="mt-6 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white"
              onClick={() => window.location.reload()}
            >
              Reload website
            </button>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}
