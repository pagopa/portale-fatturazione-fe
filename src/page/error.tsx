import { Typography, Box } from "@mui/material";
import { IllusError } from "@pagopa/mui-italia";

const ErrorPage : React.FC = () =>{

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
                    <Typography sx={{textAlign:'center', marginBottom:'24px'}} >
                    A causa di un errore di sistema non è possibile completare la procedura.
                    </Typography>
                </div>
            </div>
    
        </div>
    
      
    );
};

export default ErrorPage;