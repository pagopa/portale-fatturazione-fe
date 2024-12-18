import { Box, ThemeProvider, Typography} from '@mui/material';
import {theme} from '@pagopa/mui-italia';
import { IllusError } from "@pagopa/mui-italia";

const  BundleError = ({ error }) => {


    console.error('ciao',error);

    return  ( <ThemeProvider theme={theme}>
        <div className='container d-flex align-items-center justify-content-center ' style={{height: '100vh'}}>
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
                        {error?.toString()}
                    </Typography>
                </div>
            </div>
    
        </div>
    </ThemeProvider>);
};

export default BundleError;