import React, {Dispatch, SetStateAction, useState} from 'react';
import { Grid, TextField, Typography } from '@mui/material';
import { ModuliCommessa, DatiCommessa} from '../../types/typeModuloCommessaInserimento';


interface RowInsComTrimestraleProps {
    sentence : string,
    textBoxHidden : boolean
    idTipoSpedizione:number,
    rowNumber : number,
    setDatiCommessa:Dispatch<SetStateAction<DatiCommessa>>,
    datiCommessa:DatiCommessa,
    meseAnno:string,
    modifica:boolean
}

const RowInserimentoCommessaTrimestrale : React.FC<RowInsComTrimestraleProps> = ({ sentence, textBoxHidden, idTipoSpedizione, rowNumber,setDatiCommessa,datiCommessa,meseAnno, modifica}) => {
    
    const [input, setInput] = useState({nazionale:0, internazionale:0});
   
    const findValueNazione = (rowNumber : number) =>{
        return datiCommessa.moduliCommessa.filter(obj => obj?.idTipoSpedizione === rowNumber)[0]?.numeroNotificheNazionali;
    };
    const findValueInternazionale = (rowNumber : number) =>{
        return datiCommessa.moduliCommessa.filter(obj => obj?.idTipoSpedizione === rowNumber)[0]?.numeroNotificheInternazionali;
    };
    const findValueTotaleNazInte = (rowNumber : number) =>{
        const x = datiCommessa.moduliCommessa.filter(obj => obj?.idTipoSpedizione === rowNumber)[0]?.totaleNotifiche;
        return x; 
    };
    console.log({modifica,datiCommessa,1:findValueNazione(rowNumber),2:findValueInternazionale(rowNumber),3:findValueTotaleNazInte,rowNumber});

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
                <Typography>{sentence}{meseAnno}</Typography>
            </Grid>
            <Grid
                sx={{ textAlign: 'center' }}
                item
                xs={2}
            >
                {/*text sotto territorio nazionale*/}
                <TextField
                    sx={{ backgroundColor: '#ffffff', width: '100px'}}
                    disabled={modifica}
                    size="small"
                    value={findValueNazione(rowNumber)}
                    InputProps={{ inputProps: { min: 0, style: { textAlign: 'center' }} }}
                    onChange={(e)=>{
                        let value = parseInt(e.target.value);
                      
                        if(!value || value < 0){
                            value = 0;
                        }
                        setInput({...input, ...{nazionale: value}});
                        setDatiCommessa((prevState:DatiCommessa)=>{
                            const arrayFiltered = prevState.moduliCommessa.filter((singleObj: ModuliCommessa)=>{
                                return singleObj.idTipoSpedizione !== idTipoSpedizione;
                            });
                            const getsingleIdTipoSpedizione = prevState.moduliCommessa.filter((singleObj: ModuliCommessa)=>{
                                return singleObj.idTipoSpedizione === idTipoSpedizione; 
                            });
                            const setNotificheNazionali = {
                                numeroNotificheNazionali: value,
                                numeroNotificheInternazionali: getsingleIdTipoSpedizione[0]?.numeroNotificheInternazionali,
                                totaleNotifiche:value + getsingleIdTipoSpedizione[0]?.numeroNotificheInternazionali,
                                idTipoSpedizione: rowNumber
                            };
                            const newModuliCommessa = [...arrayFiltered, setNotificheNazionali];
                            const newState = {moduliCommessa:newModuliCommessa };
                            return newState;
                        });
                    }}
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
                            disabled={modifica}
                            size="small"
                            value={findValueInternazionale(rowNumber)}
                            InputProps={{ inputProps: { min: 0, style: { textAlign: 'center' }} }}
                            onChange={(e)=>{
                                let value = parseInt(e.target.value);
                                if(!value || value < 0){
                                    value = 0;
                                }
                                setInput({...input, ...{internazionale: value}});
                                setDatiCommessa((prevState:DatiCommessa)=>{
                                    const arrayFiltered = prevState.moduliCommessa.filter((singleObj: ModuliCommessa)=>{
                                        return singleObj.idTipoSpedizione !== idTipoSpedizione;
                                    });
                                    const getsingleIdTipoSpedizione = prevState.moduliCommessa.filter((singleObj: ModuliCommessa)=>{
                                        return singleObj.idTipoSpedizione === idTipoSpedizione; 
                                    });
                                    const setNotificheInternazionali = {
                                        numeroNotificheNazionali: getsingleIdTipoSpedizione[0].numeroNotificheNazionali,
                                        numeroNotificheInternazionali: value,
                                        totaleNotifiche:value + getsingleIdTipoSpedizione[0].numeroNotificheNazionali,
                                        idTipoSpedizione: rowNumber
                                    };
                                    const newModuliCommessa = [...arrayFiltered, setNotificheInternazionali];
                                    const newState = {moduliCommessa:newModuliCommessa };
                                    return newState;
                                });
                            }}
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
                    {findValueTotaleNazInte(rowNumber) }
                </Typography>
            </Grid>
        </Grid>
    );
};
export default RowInserimentoCommessaTrimestrale;