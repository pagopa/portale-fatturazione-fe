import {
    Typography, Card, CardContent, CardActions, Button
} from '@mui/material';
import {useEffect} from 'react';
import { useNavigate } from 'react-router';
import {MonogramPagoPACompany} from '@pagopa/mui-italia';
import {  getAuthProfilo } from '../api/api';
import { LoginProps } from '../types/typesGeneral';

const LoginPage : React.FC<LoginProps> = ({ setCheckProfilo}) =>{

    const navigate = useNavigate();

    const getDataUser = localStorage.getItem('dati')|| '{}';
    const dataUser = JSON.parse(getDataUser);

    const getProfilo = async ()=>{
                   
        await getAuthProfilo(dataUser.token)
            .then(res =>{
                console.log({res}, 'ffff');
                setCheckProfilo(true);
                navigate("/");
            } )
            .catch(err => {
                
                alert(err);
            });
    };

  
 
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