import { MsalProvider} from '@azure/msal-react';
import RouteProfile from './router/route';
import { ErrorBoundary } from "react-error-boundary";
import BundleError from './components/reusableComponents/bundleError';
import { redirect } from './api/api';


const App = ({ instance }) => {

 

    return (
       
        <MsalProvider instance={instance}>
            <ErrorBoundary 
                FallbackComponent={BundleError}
                onReset={() => {
                    localStorage.clear();
                    window.location.href = redirect;
                }}>
                <RouteProfile></RouteProfile>
            </ErrorBoundary>  
        </MsalProvider>
     
    );
};

export default App;
