import { getModuloCommessaPdf } from "../api/api";
import {useEffect} from 'react';
import { ModuloComPdfProps } from "../types/typesGeneral";
import {Typography, Button, Grid} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ButtonNaked} from '@pagopa/mui-italia';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { useNavigate } from "react-router";


const ModuloCommessaPdf : React.FC<ModuloComPdfProps> = ({setInfoModuloCommessa,infoModuloCommessa}) =>{

    const navigate = useNavigate();

    const state = localStorage.getItem('statusApplication') || '{}';
    const statusApp =  JSON.parse(state);

    

    const getPdf = async() =>{
        getModuloCommessaPdf(statusApp.anno,statusApp.mese).then((res)=>{
            console.log({res}, 'PDF');
        }).catch((err)=>{
            console.log(err);
        });

     

        
    };
    useEffect(()=>{
        getPdf();
    },[]);
    
   

    return (
        <div>
            <div className='d-flex marginTop24'>
                <ButtonNaked
                    color="primary"
                    onFocusVisible={() => { console.log('onFocus'); }}
                    size="small"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/8') }
                   
                >
                    Esci
 
                </ButtonNaked>
              
                <Typography sx={{ fontWeight:'bold', marginLeft:'20px'}} variant="caption">

                    <ViewModuleIcon sx={{paddingBottom:'3px'}}  fontSize='small'></ViewModuleIcon>
                      Modulo commessa 
                    
                </Typography>
                <Typography  variant="caption">/ Mese</Typography>
                 
                 
                
            </div>

            <div>
                <Grid container spacing={2}>
                    <Grid item xs={5}>
                        <div>
                            <Typography variant="caption">Soggetto aderente</Typography>
                        </div>
                    </Grid>
                    <Grid item xs={7}>
                        <div>xs=4</div>
                    </Grid>
                    
                </Grid>

            </div>

        </div>
    );
};
export default ModuloCommessaPdf;