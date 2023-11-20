import React, {useEffect, useState} from 'react';
import { Grid, TextField, Typography } from '@mui/material';
import { RowInsComProps, ModuliCommessa, DatiCommessa , DataTotaleObj} from '../types/typeModuloCommessaInserimento';
import YupString from '../validations/string/index';




const RowInserimentoCommessa : React.FC<RowInsComProps> = ({ sentence, textBoxHidden,setDatiCommessa, idTipoSpedizione, setInputTotale, rowNumber}) => {
    
    const [error, setError] = useState(false);
    const [input, setInput] = useState({nazionale:0, internazionale:0});
    const [totaleNotifiche, setTotaleNotifiche] = useState(0);

    useEffect(()=>{
        setTotaleNotifiche(input.nazionale + input.internazionale);
    },[input]);
 
    /*
    const validationTextField = (input:number) =>{
        YupString.matches(/^[1-9][0-9]*$/,  {
            message: "Non è possibile inserire numeri negatii",
            excludeEmptyString: true
        }).validate(input)
            .then(()=>{
            //setErrorValidation(false);
            //setStatusBottmConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:false}}) );
            }).catch(() =>{
            // setErrorValidation(true);
            //setStatusBottmConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:true}}) );
            } );
    };*/
 
 

    const hendleOnBlur = (e: React.SyntheticEvent<EventTarget>) =>{

        return 'ciao';
    };

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
                {/*text sotto territorio nazionale*/}
                <TextField
                    sx={{ backgroundColor: '#ffffff', width: '100px'}}
                    type="number"
                    size="small"
                    InputProps={{ inputProps: { min: 0, style: { textAlign: 'center' }} }}
                    onBlur={(e)=>hendleOnBlur(e)}
                    onChange={(e)=>{

                        const value = parseInt(e.target.value);
                        setInput({...input, ...{nazionale: value}});


                        if(rowNumber === 1){
                            setInputTotale((prev: DataTotaleObj) => ({...prev,...{ digitaleNazionale:value} }));
                        }else if(rowNumber === 2){
                            setInputTotale((prev: DataTotaleObj) => ({...prev,...{ analogicoNazionale:value} }));
                        }else{
                            setInputTotale((prev: DataTotaleObj) => ({...prev,...{ analNotificaNazionale:value} }));
                        }
                        
                        setDatiCommessa((prevState:DatiCommessa)=>{
                          
                            const arrayFiltered = prevState.moduliCommessa.filter((singleObj: ModuliCommessa)=>{
                                return singleObj.idTipoSpedizione !== idTipoSpedizione;
                            });
                            const getNumeroNotificheInternazionali = prevState.moduliCommessa.filter((singleObj: ModuliCommessa)=>{
                                return singleObj.idTipoSpedizione === idTipoSpedizione; 
                            });

                            let numeroNotificheInternazionali = 0;
                            if(getNumeroNotificheInternazionali[0]){
                                numeroNotificheInternazionali = getNumeroNotificheInternazionali[0].numeroNotificheInternazionali;
                            }
                          
                            const setNotificheNazionali = {
                                numeroNotificheNazionali: value,
                                numeroNotificheInternazionali: numeroNotificheInternazionali,
                                idTipoSpedizione: idTipoSpedizione
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
                            type="number"
                            size="small"
                            InputProps={{ inputProps: { min: 0, style: { textAlign: 'center' }} }}
                            onChange={(e)=>{

                                const value = parseInt(e.target.value);
                                setInput({...input, ...{internazionale: value}});

                                if(rowNumber === 1){
                                    setInputTotale((prev: DataTotaleObj) => ({...prev,...{ digitaleInternazionale:value} }));
                                }else if(rowNumber === 2){
                                    setInputTotale((prev: DataTotaleObj) => ({...prev,...{ analogicoInternazionale:value} }));
                                }else{
                                    setInputTotale((prev: DataTotaleObj) => ({...prev,...{ analNotificaInternazionale:value} }));
                                }
                               
                                setDatiCommessa((prevState:DatiCommessa)=>{
                                  
                                    const arrayFiltered = prevState.moduliCommessa.filter((singleObj: ModuliCommessa)=>{
                                        return singleObj.idTipoSpedizione !== idTipoSpedizione;
                                    });
                                    const getNumeroNotificheNazionali = prevState.moduliCommessa.filter((singleObj: ModuliCommessa)=>{
                                        return singleObj.idTipoSpedizione === idTipoSpedizione; 
                                    });
        
                                    let numeroNotificheNazionali = 0;
                                    if(getNumeroNotificheNazionali[0]){
                                        numeroNotificheNazionali = getNumeroNotificheNazionali[0].numeroNotificheNazionali;
                                    }
                                  
                                    const setNotificheInternazionali = {
                                        numeroNotificheNazionali: numeroNotificheNazionali,
                                        numeroNotificheInternazionali: value ,
                                        idTipoSpedizione: idTipoSpedizione
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
                    {totaleNotifiche}
                </Typography>
            </Grid>

        </Grid>
    );
};
export default RowInserimentoCommessa;