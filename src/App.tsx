import { MsalProvider} from '@azure/msal-react';
import RouteProfile from './router/route';
import { ErrorBoundary } from "react-error-boundary";
import BundleError from './components/reusableComponents/bundleError';
import { redirect } from './api/api';


const App = ({ instance }) => {
    {/*
    const  copyCode = () => {
        const profile = localStorage.getItem('globalState') || '{}';
        const result =  JSON.parse(profile);
        console.log(result);
        
        const linkText1 = document.getElementById('textError1')?.textContent;
        const linkText2 = document.getElementById('textError2')?.textContent;
        const linkText3 = document.getElementById('textError3')?.textContent;
        const allTexts = `${linkText1}\n${linkText2}\n${linkText3}`;

        // Use the Clipboard API to copy the concatenated text
        if(result.profilo.auth === 'PAGOPA'){ 
            window.location.href = '/azureLogin';
        }else{
            navigator.clipboard.writeText(allTexts); 
        }
        
    };

   <ErrorBoundary 
                FallbackComponent={BundleError}
                onReset={() => {
                    //localStorage.clear();
                    copyCode();
                }}>
                
            </ErrorBoundary> */}  
 

    return (
       
        <MsalProvider instance={instance}>
            <RouteProfile></RouteProfile>
        </MsalProvider>
     
    );
};

export default App;
