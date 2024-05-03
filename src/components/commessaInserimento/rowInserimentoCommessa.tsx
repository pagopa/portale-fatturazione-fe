import React, {useEffect, useState,useContext} from 'react';
import { Grid, TextField, Typography } from '@mui/material';
import { RowInsComProps, ModuliCommessa, DatiCommessa} from '../../types/typeModuloCommessaInserimento';
import YupString from '../../validations/string/index';
import { InsModuloCommessaContext } from '../../types/typeModuloCommessaInserimento';
import { InserimentoModuloCommessaContext } from '../../page/moduloCommessaInserimentoUtEn30';
import { getStatusApp } from '../../reusableFunction/actionLocalStorage';
import { month } from '../../reusableFunction/reusableArrayObj';

const RowInserimentoCommessa : React.FC<RowInsComProps> = ({ sentence, textBoxHidden, idTipoSpedizione, rowNumber}) => {
    const { setDatiCommessa,setDisableContinua, datiCommessa, mainState} = useContext<InsModuloCommessaContext>(InserimentoModuloCommessaContext);

    const statusApplication = getStatusApp();
   
    const [errorNazionale, setErrorNazionale] = useState(false);
    const [errorInternazionale, setErrorInternazionale] = useState(false);
    const [input, setInput] = useState({nazionale:0, internazionale:0});
    const [totaleNotifiche, setTotaleNotifiche] = useState(0);

    useEffect(()=>{
        setTotaleNotifiche(input.nazionale + input.internazionale);
    },[input]);

    let mese = '';
    let anno = 2000;
    if(statusApplication.inserisciModificaCommessa === 'MODIFY' ){
        mese = month[statusApplication.mese -1 ];
        anno = statusApplication.anno;
    }else{
        const mon = new Date().getMonth();
        const date = new Date();
        if(mon === 11){
            anno = date.getFullYear()+1;
        }else{
            anno = date.getFullYear();
        }
        mese = month[mon + 1 ];
    }

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

    const hendleOnBlur = (e:React.FocusEvent<HTMLTextAreaElement | HTMLInputElement, Element>) =>{
        e.persist();
        const num = Number(e.target.value);
        validationAllowNumberColumNazionale(num, setErrorNazionale);
        validationAllowNumberColumnInternazionale(num, setErrorNazionale);
    };
    const hendleOnBlur2 = (e:React.FocusEvent<HTMLTextAreaElement | HTMLInputElement, Element>) =>{
        e.persist();
        const num = Number(e.target.value);
        validationAllowNumberColumNazionale(num, setErrorInternazionale);
        validationAllowNumberColumnInternazionale(num, setErrorInternazionale);
    };

    const findValueNazione = (rowNumber : number) =>{
        return datiCommessa.moduliCommessa.filter(obj => obj.idTipoSpedizione === rowNumber)[0]?.numeroNotificheNazionali;
    };
    const findValueInternazionale = (rowNumber : number) =>{
        return datiCommessa.moduliCommessa.filter(obj => obj.idTipoSpedizione === rowNumber)[0]?.numeroNotificheInternazionali;
    };
    const findValueTotaleNazInte = (rowNumber : number) =>{
        const x = datiCommessa.moduliCommessa.filter(obj => obj.idTipoSpedizione === rowNumber)[0]?.totaleNotifiche;
        return x; 
    };

    const meseAnno = <span className="fw-semibold"> {mese}/{anno}</span>;
  
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
                    disabled={mainState.statusPageInserimentoCommessa === 'immutable'}
                    size="small"
                    value={findValueNazione(rowNumber)}
                    InputProps={{ inputProps: { min: 0, style: { textAlign: 'center' }} }}
                    error={errorNazionale}
                    onBlur={(e)=>hendleOnBlur(e)}
                    onChange={(e)=>{
                        let value = parseInt(e.target.value);
                        if(!value){
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
                            disabled={mainState.statusPageInserimentoCommessa === 'immutable'}
                            size="small"
                            value={findValueInternazionale(rowNumber)}
                            InputProps={{ inputProps: { min: 0, style: { textAlign: 'center' }} }}
                            error={errorInternazionale}
                            onBlur={(e)=>hendleOnBlur2(e)}
                            onChange={(e)=>{
                                let value = parseInt(e.target.value);
                                if(!value){
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
export default RowInserimentoCommessa;