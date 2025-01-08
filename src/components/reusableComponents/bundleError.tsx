import { Box, Button, ListItemText, ThemeProvider, Typography} from '@mui/material';
import {theme} from '@pagopa/mui-italia';
import { IllusError } from "@pagopa/mui-italia";

function  BundleError({ error, resetErrorBoundary }){

    let line1 = error.message;
    let line2 = '';

    if(error?.stack?.split("\n")[0]){
        line1 = error?.stack?.split("\n")[0];
    }

    if(error.stack?.split("\n")[1]){
        line2 = error.stack?.split("\n")[1];
    }

    const infoDate = new Date().toISOString();

    return  ( <ThemeProvider theme={theme}>
        <div className='container d-flex align-items-center justify-content-center' style={{height: '100vh'}}>
            <div>
                <div >
                    <Box sx={{textAlign:'center', paddingTop:'24px'}} >
                        <IllusError title='errore' />
                    </Box>
                </div>
                <div className='m-3 p-3'>
                    <Typography sx={{textAlign:'center'}} variant="h3">Qualcosa è andato storto</Typography>
                </div>
                <div className='bg-light rounded-3 m-3 p-3'>
                    <Typography sx={{textAlign:'center'}} variant="body1">
                    Siamo spiacenti, ma si è verificato un errore imprevisto durante l'utilizzo del portale.
                    </Typography>
                    <Typography sx={{textAlign:'center'}} variant="body1">
                    Il nostro team sta lavorando per risolvere questo problema il più rapidamente possibile.
                    </Typography>
                    <Typography sx={{textAlign:'center'}} variant="body1">
                    Grazie per la comprensione.
                    </Typography>
                </div>
                <div className='bg-light rounded-3 m-3 p-3'>
                    <Typography sx={{textAlign:'center'}} variant="body1">
                    Contattare l'amministratore del sito web e fornire i seguenti dati:
                        <div>
                            <ListItemText primary="Screen dell'errore mostrato" />
                        </div>
                    </Typography>
                </div>
                
                <div  className='bg-light rounded-3 m-4 p-4 border border-danger'>
                    <Typography variant="h6" sx={{textAlign:'center', marginBottom:'24px'}} >
                        {line1}
                    </Typography>
                    <Typography variant="h6" sx={{textAlign:'center', marginBottom:'24px'}} >
                        {line2}
                    </Typography>
                    <Typography variant="h6" sx={{textAlign:'center', marginBottom:'24px'}} >
                        {infoDate}
                    </Typography>
                </div>
                <div className='container d-flex align-items-center justify-content-center mt-5'>
                    <Button 
                        variant="contained"
                        onClick={()=> resetErrorBoundary()}
                    >Reload</Button>
                </div>
            </div>
            
    
        </div>
    </ThemeProvider>);
}

export default BundleError;