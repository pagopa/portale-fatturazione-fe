import React, {useEffect, useState,useContext} from 'react';
import { Grid, TextField, Typography } from '@mui/material';
import { RowInsComProps, ModuliCommessa, DatiCommessa , DataTotaleObj} from '../types/typeModuloCommessaInserimento';
import YupString from '../validations/string/index';
import { InsModuloCommessaContext } from '../types/typeModuloCommessaInserimento';
import { InserimentoModuloCommessaContext } from '../page/moduloCommessaInserimentoUtEn30';




const RowInserimentoCommessa : React.FC<RowInsComProps> = ({ sentence, textBoxHidden, idTipoSpedizione, setInputTotale, rowNumber}) => {
    const { setDatiCommessa,setDisableContinua} = useContext<InsModuloCommessaContext>(InserimentoModuloCommessaContext);


    const [errorNazionale, setErrorNazionale] = useState(false);
    const [errorInternazionale, setErrorInternazionale] = useState(false);
    const [input, setInput] = useState({nazionale:0, internazionale:0});
    const [totaleNotifiche, setTotaleNotifiche] = useState(0);

    useEffect(()=>{
        setTotaleNotifiche(input.nazionale + input.internazionale);
    },[input]);
 
   
    const validationAllowNumberColumNazionale = (input:number, set:any) =>{
        YupString.matches(/^[0-9]*$/,  {
            message: "Non è possibile inserire numeri negatii",
            excludeEmptyString: true
        }).validate(input)
            .then(()=>{
                set(false);
        
            }).catch(() =>{
                setDisableContinua(true);
                set(true);
          
            } );
    };


    const validationAllowNumberColumnInternazionale = (input:number, set:any) =>{
        YupString.matches(/^[0-9]*$/,  {
            message: "Non è possibile inserire numeri negatii",
            excludeEmptyString: true
        }).validate(input)
            .then(()=>{
                set(false);
        
            }).catch(() =>{
                setDisableContinua(true);
                set(true);
      
            } );
    };
 
 

    const hendleOnBlur = (e:any) =>{
        e.persist();
      
        validationAllowNumberColumNazionale(e.target.value, setErrorNazionale);
        validationAllowNumberColumnInternazionale(e.target.value, setErrorNazionale);
    
    };
    const hendleOnBlur2 = (e:any) =>{
        e.persist();
        validationAllowNumberColumNazionale(e.target.value, setErrorInternazionale);
        validationAllowNumberColumnInternazionale(e.target.value, setErrorInternazionale);
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
                    
                    size="small"
                    InputProps={{ inputProps: { min: 0, style: { textAlign: 'center' }} }}
                    error={errorNazionale}
                    onBlur={(e)=>hendleOnBlur(e)}
                    onChange={(e)=>{

                        let value = parseInt(e.target.value);
                      
                        if(!value){
                            value = 0;
                        }
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
                           
                            size="small"
                            InputProps={{ inputProps: { min: 0, style: { textAlign: 'center' }} }}
                            error={errorInternazionale}
                            onBlur={(e)=>hendleOnBlur2(e)}
                            onChange={(e)=>{

                                let value = parseInt(e.target.value);
                                if(!value){
                                    value = 0;
                                }
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