import { Typography, Box } from "@mui/material";
import { IllusError } from "@pagopa/mui-italia";
import { redirect } from "../api/api";
import { ErrorPageProps } from "../types/typesGeneral";
import { getProfilo, getToken } from "../reusableFunctin/actionLocalStorage";

const ErrorPage : React.FC<ErrorPageProps> = ({dispatchMainState, mainState}) =>{
    const token =  getToken();
    const profilo =  getProfilo();

    const message = 'Il path selezionato è errato';

    if(!token){
        window.location.href = redirect;
    }

    return(
       
        <div className='container d-flex align-items-center justify-content-center ' style={{height: '400px'}}>
            <div>
           
                <div >
                    <Box sx={{textAlign:'center', paddingTop:'24px'}} >
                        <IllusError title='errore' />
                    </Box>
                
                </div>
                <div>
                    <Typography sx={{textAlign:'center',paddingTop:'24px'}} variant="h3">Qualcosa è andato storto</Typography>
                </div>
                <div className='marginTop24'>
                    <Typography variant="h6" sx={{textAlign:'center', marginBottom:'24px'}} >
                        {message}
                    </Typography>
                </div>
            </div>
    
        </div>
      
    );
};

export default ErrorPage;