import React from 'react';
import { Grid , Typography} from '@mui/material';
import LabelComponent from './label';
import { PrimoContainerInsComProps } from '../../types/typeModuloCommessaInserimento';

const PrimoContainerInsCom : React.FC<PrimoContainerInsComProps> = () => {

    const getStatusApplication = localStorage.getItem('statusApplication') || '{}';
    const statusApplication =  JSON.parse(getStatusApplication);

    const getProfilo = localStorage.getItem('profilo') || '{}';
    const profilo =  JSON.parse(getProfilo);
   
    const month = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre", "Gennaio"];

    let mese = '';
    let anno = 2000;
    if(statusApplication.inserisciModificaCommessa === 'MODIFY' ){
        mese = month[statusApplication.mese -1 ];
        anno = statusApplication.anno;
    }else if(statusApplication.inserisciModificaCommessa === 'INSERT'){
        const mon = new Date().getMonth();
        const date = new Date();
        if(mon === 11){
            anno = date.getFullYear()+1;
            mese = month[mon + 1 ];
        }else{
            anno = date.getFullYear();
            mese = month[mon + 1 ];
        }

    }

    const data = `${mese}/${anno}`;
   
    let exampleTipoContratto = "PAC";
    if(profilo.idTipoContratto === 1){
        exampleTipoContratto = 'PAL';
    }

    return (
        <div className="m-3">
            <Grid
                container
                spacing={2}
                columns={12}
            >

                <Grid
                    sx={{ textAlign: 'center' }}
                    item
                    xs={6}
                >
                    <div>
                        <LabelComponent label="Mese/Anno:" input={data} />
                        <LabelComponent label="Tipo Contratto:" input={exampleTipoContratto} />
                    </div>
         
                </Grid>

                <Grid
                    item
                    xs={2}
                >
                    <Typography sx={{fontWeight:'bold', textAlign:'center'}}>Territorio nazionale</Typography>
                </Grid>
                <Grid
                    item
                    xs={2}
                >
                    <Typography sx={{fontWeight:'bold', textAlign:'center'}}>Territorio diverso da nazionale</Typography>
                </Grid>
                <Grid
                    item
                    xs={2}
                >
                    <Typography sx={{fontWeight:'bold', textAlign:'center'}}>Totale notifiche da processare</Typography>
                </Grid>

            </Grid>
        </div>
    );
};
export default  PrimoContainerInsCom;