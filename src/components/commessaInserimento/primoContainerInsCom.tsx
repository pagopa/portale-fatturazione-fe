import React from 'react';
import { Grid , Typography} from '@mui/material';
import LabelComponent from './label';
import { PrimoContainerInsComProps } from '../../types/typeModuloCommessaInserimento';
import { month } from '../../reusableFunction/reusableArrayObj';
import { useGlobalStore } from '../../store/context/useGlobalStore';


const PrimoContainerInsCom : React.FC<PrimoContainerInsComProps> = () => {
 
    const mainState = useGlobalStore(state => state.mainState);
    const profilo =  mainState.profilo;
    
    let mese = '';
    let anno = 2000;
    if(mainState.inserisciModificaCommessa === 'MODIFY' ){
        mese = month[Number(mainState.mese) -1 ];
        anno = Number(mainState.anno);
    }else if(mainState.inserisciModificaCommessa === 'INSERT'){
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