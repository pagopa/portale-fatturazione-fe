import React, { useState, Suspense } from "react";



const BundleError = ({children}) => {
    const [retryKey, setRetryKey] = useState(0); // Key to force re-rendering on retry
    const [hasError, setHasError] = useState(false); // Track loading errors

    const handleRetry = () => {
        setHasError(false); // Reset error state
        setRetryKey((prev) => prev + 1); // Trigger a re-render
    };

    return (
        <div>
            {hasError ? (
                <div>
                    <h2>Error Loading Component</h2>
                    <p>Something went wrong while loading the component.</p>
                    <button onClick={handleRetry}>Retry</button>
                </div>
            ) : (
               
                <ErrorBoundary setHasError={setHasError} key={retryKey}>
                    {children}
                </ErrorBoundary>
              
            )}
        </div>
    );
};

// ErrorBoundary as a functional component
const ErrorBoundary = ({ setHasError, children }) => {
    try {
        return children;
    } catch (error) {
        setHasError(true);
        console.error("Caught an error in the boundary:", error);
        return null;
    }
};

export default BundleError;
