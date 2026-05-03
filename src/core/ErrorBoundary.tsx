/**
 * src/core/ErrorBoundary.tsx
 *
 * React Class Component that catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 * Error boundaries catch errors during rendering, in lifecycle methods, and in constructors
 * of the whole tree below them.
 */

import React, { type ErrorInfo, type ReactNode } from "react"; // Import React and necessary types

/**
 * Props interface for the ErrorBoundary component.
 */
interface ErrorBoundaryProps {
  children: ReactNode; // The child components that the error boundary will protect
  fallback: (errorKey: string, reset: () => void) => ReactNode; // A render prop to display fallback UI
}

/**
 * State interface for the ErrorBoundary component.
 */
interface ErrorBoundaryState {
  hasError: boolean; // Indicates if an error has occurred
  errorKey: string; // Stores the locale key for the error message
}

/**
 * ErrorBoundary class component.
 * Catches any rendering error in its children tree, maintains state for error,
 * and renders a fallback UI using a render prop when an error occurs.
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  /**
   * Initializes the state of the error boundary.
   * @param props The properties passed to the component.
   */
  constructor(props: ErrorBoundaryProps) {
    super(props); // Call the parent class constructor
    this.state = { hasError: false, errorKey: "" }; // Initialize state with no error
  }

  /**
   * This static method is called after an error has been thrown by a descendant component.
   * It receives the error that was thrown as a parameter and should return a value to
   * update the state.
   * @param error The error that was thrown.
   * @returns An object to update the state, indicating an error has occurred.
   */
  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state to render the fallback UI
    return { hasError: true, errorKey: error.message }; // Set hasError to true and store error message as key
  }

  /**
   * This method is called after an error has been thrown by a descendant component.
   * It receives two parameters: the error and an object with information about the component
   * stack trace. It's used for logging error information.
   * @param error The error that was caught.
   * @param errorInfo An object with `componentStack` information.
   */
  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to the console for debugging
    console.error("Error caught by ErrorBoundary:", error, errorInfo); // Do not swallow silently
  }

  /**
   * Resets the error boundary's state, clearing any caught errors
   * and allowing the children to render again.
   */
  public resetErrorBoundary = (): void => {
    this.setState({ hasError: false, errorKey: "" }); // Reset hasError to false and clear errorKey
  };

  /**
   * Renders the component. If an error has occurred, it renders the fallback UI.
   * Otherwise, it renders the child components.
   * @returns The ReactNode to be rendered.
   */
  public render(): ReactNode {
    if (this.state.hasError) {
      // If an error has occurred
      return this.props.fallback(this.state.errorKey, this.resetErrorBoundary); // Render the fallback UI with errorKey and reset function
    }

    return this.props.children; // Otherwise, render the children
  }
}
