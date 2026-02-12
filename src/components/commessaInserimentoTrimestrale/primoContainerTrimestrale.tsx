import React from 'react';
import { Grid , Typography} from '@mui/material';
import LabelComponent from '../commessaInserimento/label';

type PrimoContainerInsComTrimestraleProps = {
    meseAnno:string,
    tipoContratto:string

}

const PrimoContainerInsComTrimestrale : React.FC<PrimoContainerInsComTrimestraleProps> = ({meseAnno, tipoContratto}) => {

  
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
                        <LabelComponent label="Mese/Anno:" input={meseAnno} />
                        <LabelComponent label="Tipo Contratto:" input={tipoContratto} />
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
export default  PrimoContainerInsComTrimestrale;