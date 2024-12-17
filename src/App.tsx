import { MsalProvider} from '@azure/msal-react';
import RouteProfile from './router/route';
import BundleError from './components/reusableComponents/bundleError';


const App = ({ instance }) => {


    return (
        <BundleError>
            <MsalProvider instance={instance}>
                <RouteProfile></RouteProfile>
            </MsalProvider>
        </BundleError>
    );
};

export default App;
