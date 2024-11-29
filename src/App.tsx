import { BrowserRouter as Router} from 'react-router-dom';
import { MsalProvider} from '@azure/msal-react';
import RouteProfile from './router/route';

const App = ({ instance }) => {
    return (
        <MsalProvider instance={instance}>
            <Router>
                {RouteProfile()}
            </Router>;
        </MsalProvider>
    );
};

export default App;
