import { MsalProvider} from '@azure/msal-react';
import RouteProfile from './router/route';
import { ErrorBoundary } from "react-error-boundary";
import BundleError from './components/reusableComponents/bundleError';
import { useState } from 'react';


const App = ({ instance }) => {

    const [hasError, setHasError] = useState<any>();

    return (
       
        <MsalProvider instance={instance}>
            <ErrorBoundary  fallback={<BundleError error={hasError}/>} onError={(err)=> setHasError(err)}>
                <RouteProfile></RouteProfile>
            </ErrorBoundary>  
        </MsalProvider>
     
    );
};

export default App;
