import { Component } from "react";
import { RiErrorWarningLine, RiRefreshLine } from "react-icons/ri";

// A single uncaught render-time error anywhere in the tree below this
// component would otherwise unmount the whole React app, leaving a
// permanent blank white screen with no recovery — the worst possible
// failure mode for a desktop app nobody can "just restart the server" on.
// This catches that and shows a recoverable error screen instead.
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled UI error:", error, info?.componentStack);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-5 bg-[#05070f] p-8 text-center text-slate-200">
        <div className="grad-ring flex h-14 w-14 items-center justify-center rounded-2xl">
          <RiErrorWarningLine className="text-2xl text-white" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-bold text-white">Something went wrong</h1>
          <p className="max-w-md text-sm text-slate-400">
            {this.props.label || "This part of the app hit an unexpected error."} You can try again,
            or reload the whole app if that doesn't help.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={this.handleReset}
            className="grad-bg inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 hover:brightness-110 cursor-pointer"
          >
            <RiRefreshLine />
            Try again
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-xl border border-white/10 bg-white/[0.06] px-5 py-2.5 text-sm font-semibold text-slate-100 hover:bg-white/[0.1] cursor-pointer"
          >
            Reload app
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
