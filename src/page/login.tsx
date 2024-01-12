import {
    Typography, Card, CardContent, CardActions, Button
} from '@mui/material';

import { useNavigate } from 'react-router';
import {MonogramPagoPACompany} from '@pagopa/mui-italia';

import { LoginProps } from '../types/typesGeneral';


// pagina non utilizzata nell'applicazione, probabilmete verra utilizzata in seguito


const LoginPage : React.FC<LoginProps> = () =>{

    const navigate = useNavigate();

    const getDataUser = localStorage.getItem('dati')|| '{}';
    const dataUser = JSON.parse(getDataUser);
   
  
 
    return (
        <div className='"d-flex justify-content-center"'>
            <div>
                <Typography sx={{textAlign:'center'}} variant="h3">Selziona il prodotto</Typography>
            </div>
            <div className='marginTop24'>
                <Typography sx={{textAlign:'center'}} >Stai entrando come ente {dataUser.ente}.</Typography>
            </div>
            <div >
                <Typography sx={{textAlign:'center'}} >Seleziona il prodotto che vuoi visualizzare</Typography>
            </div>
          
            <div className='marginTop24'>
                {[dataUser.prodotto].map(()=>{
                    return(
                        <Card raised sx={{
                            maxWidth: 300
                        }}>
                            <div className='container d-flex align-items-center justify-content-center'>
                                <div >
                                    <MonogramPagoPACompany
                                        color="primary"
                                        shape="circle"
                                    />
                                </div>
                            </div>
            
                            <CardContent>
                                <Typography sx={{textAlign:'center'}} variant="h6" gutterBottom>
            Send - Servizio
            Notifiche Digitali
                                </Typography>
                            </CardContent>
                            <CardActions>
                            </CardActions>
                        </Card>
                    );

                })}
               
            </div>
            <div className='marginTop24 d-flex justify-content-around'>
               
                <Button variant="contained">Indietro</Button>
                
                <Button variant="outlined">Continua</Button>
               
                
               
            </div>
           

        </div>
    );
};
export default LoginPage;