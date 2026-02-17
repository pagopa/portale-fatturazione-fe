import { MsalProvider} from '@azure/msal-react';
import RouteProfile from './router/route';

const App = ({ instance }) => {
    //github
    return (
       
        <MsalProvider instance={instance}>
            <RouteProfile></RouteProfile>
        </MsalProvider>
     
    );
};

export default App;
