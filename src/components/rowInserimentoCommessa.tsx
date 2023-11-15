import { Grid, TextField, Typography } from '@mui/material';
import React from 'react';

interface RowInsComProps {
    sentence : string,
    textBoxHidden : boolean
}

const RowInserimentoCommessa : React.FC<RowInsComProps> = ({ sentence, textBoxHidden }) => {
    const mese= <span className="fw-semibold"> Novembre/2023</span>;
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

                <p>{sentence}{mese}</p>
            </Grid>

            <Grid
                sx={{ textAlign: 'center' }}
                item
                xs={2}
            >
                <TextField
                    sx={{ backgroundColor: '#ffffff', width: '100px', textAlign: 'center' }}
                    type="number"
                    size="small"
                />
            </Grid>
            <Grid
                sx={{ paddingBottom: '16px', textAlign: 'center' }}
                item
                xs={2}
            >
                {textBoxHidden ? null
                    : (
                        <TextField
                            sx={{ backgroundColor: '#ffffff', width: '100px' }}
                            type="number"
                            size="small"
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
          10
                </Typography>
            </Grid>

        </Grid>
    );
};
export default RowInserimentoCommessa;