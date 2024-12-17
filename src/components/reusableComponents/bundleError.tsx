import React, { useState } from "react";

const  BundleError = ({ children }: { children: React.ReactNode }) => {
    const [hasError, setHasError] = useState(false);

    const handleError = (error: Error) => {
        console.error("Caught an error:", error);
        setHasError(true);
    };

    try {
        if (hasError) throw new Error("Something went wrong!");
        return <>{children}</>;
    } catch (error) {
        handleError(error as Error);
        return <div>Oops! An error occurred.</div>;
    }
};

export default BundleError;