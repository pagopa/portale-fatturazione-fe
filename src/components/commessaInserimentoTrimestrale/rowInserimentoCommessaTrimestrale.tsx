import React from 'react';
import { Grid, TextField, Typography } from '@mui/material';
interface RowInsComTrimestraleProps {
    sentence : string,
    textBoxHidden : boolean
    setValue:(e,key) => void,
    keys:string[],
    values:string|number[]
    meseAnno:string,
    modifica:boolean,
    totale:number
}

const RowInserimentoCommessaTrimestrale : React.FC<RowInsComTrimestraleProps> = ({ sentence, setValue,values,meseAnno, modifica,keys, totale}) => {
    return (
        <Grid
            sx={{ marginTop: '20px' }}
            container
            columns={12}
        >
            <Grid
                sx={{
                    textAlign: 'left',
                    borderColor: '#ffffff',
                    borderStyle: 'solid',
                }}
                item
                xs={6}
            >
                <Typography>{sentence}<span style={{fontWeight:'bold'}}>{meseAnno}</span></Typography>
            </Grid>
            <Grid
                sx={{ textAlign: 'center' }}
                item
                xs={2}
            >
                {/*text sotto territorio nazionale*/}
                <TextField
                    sx={{ backgroundColor: '#ffffff', width: '100px'}}
                    disabled={!modifica}//da modificare
                    size="small"
                    value={values[0]||0}
                    InputProps={{ inputProps: { min: 0, style: { textAlign: 'center' }} }}
                    onChange={(e)=>setValue(e,keys[0])}
                />
            </Grid>
            <Grid
                sx={{ paddingBottom: '16px', textAlign: 'center' }}
                item
                xs={2}
            >
                {keys.length < 2 ? null
                    : (
                        <TextField
                            sx={{ backgroundColor: '#ffffff', width: '100px' }}
                            disabled={!modifica}
                            size="small"
                            value={values[1]||0}
                            InputProps={{ inputProps: { min: 0, style: { textAlign: 'center' }} }}
                            onChange={(e)=>setValue(e,keys[1])}
                        />
                    )}
            </Grid>
            <Grid
                sx={{ textAlign: 'center', marginTop:'8.5px' }}
                item
                xs={2}
            >
                <Typography
                    variant="caption-semibold"
                    sx={{fontSize:'18px'}}
                >
                    {totale}
                </Typography>
            </Grid>
        </Grid>
    );
};
export default RowInserimentoCommessaTrimestrale;