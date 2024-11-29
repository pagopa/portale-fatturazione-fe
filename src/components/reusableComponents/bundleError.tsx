import React, { useState, useEffect } from "react";

const BundleError: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [error, setError] = useState<Error | null>(null);

    const resetError = () => setError(null);

    useEffect(() => {
    // Example for logging error to an external service
        if (error) {
            console.error("Caught an error:", error);
        }
    }, [error]);

    try {
        if (error) throw error;
        return <>{children}</>;
    } catch (err) {
        return (
            <div role="alert" style={{ padding: "1rem", textAlign: "center" }}>
                <h2>Oops! An error occurred</h2>
                <p>{(err as Error).message}</p>
                <button onClick={resetError}>Retry</button>
            </div>
        );
    }
};

export default BundleError;