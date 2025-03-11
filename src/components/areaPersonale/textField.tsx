import React, {useState,useEffect, useContext} from 'react';
import {TextField,} from '@mui/material';
import {DatiFatturazione, TextFieldProps, StateEnableConferma}  from '../../types/typesAreaPersonaleUtenteEnte';
import { _YupPec} from '../../validations/email/index';
import YupString from '../../validations/string/index';
import { getValidationCodiceSdi } from '../../api/apiPagoPa/datiDiFatturazionePA/api';
import { GlobalContext } from '../../store/context/globalContext';
import { getValidationCodiceSdiEnte } from '../../api/apiSelfcare/datiDiFatturazioneSE/api';



const TextFieldComponent : React.FC<TextFieldProps> = props => {

    const globalContextObj = useContext(GlobalContext);
    const {
        setOpenModalInfo
    } = globalContextObj;

  
    
    const {
        helperText,
        label,
        placeholder,
        fullWidth,
        value,
        keyObject,
        dataValidation,
        required,
        mainState,
        setDatiFatturazione,
        setStatusButtonConferma,
        datiFatturazione,
    } = props;
    
    const [errorValidation, setErrorValidation] = useState(false);

    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;
    
    // ogni qual volta csul click indietro richaimo i dati di fatturazione e setto tutti gli errori a false
    /* useEffect(()=>{
    if((keyObject === 'cup' && datiFatturazione.cup === '' &&  datiFatturazione.idDocumento !== '') || (keyObject === 'idDocumento' && datiFatturazione.idDocumento === '' &&  datiFatturazione.cup !== '')){
    return; 
    }else{
    setErrorValidation(false);
    }
    
    },[mainState]);
    */
    
    useEffect(()=>{
        /*if(keyObject === 'cup' && datiFatturazione.idDocumento !== '' && datiFatturazione.cup === ''){
        setErrorValidation(true);
        setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:true}}) );
        }else if(keyObject === 'cup' && datiFatturazione.idDocumento === '' && datiFatturazione.cup === ''){
        setErrorValidation(false);
        setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:false}}) );
        }*/
        if(keyObject === 'idDocumento' && datiFatturazione.idDocumento === '' && datiFatturazione.cup !== ''){
            setErrorValidation(true);
            setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:true}}) );
        }else if(keyObject === 'idDocumento' && datiFatturazione.idDocumento === '' && datiFatturazione.cup === ''){
            setErrorValidation(false);
            setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:false}}) );
        }
        
    },[datiFatturazione.cup]);

    //logica aggiunta pe lo SDI 19/11 start

    const sdiIsValid = async() =>{
        if(profilo.auth === 'PAGOPA'){
            await getValidationCodiceSdi(token,profilo.nonce,{idEnte:profilo.idEnte,codiceSDI:datiFatturazione.codiceSDI})
                .then((res)=>{
                    setErrorValidation(false);
                    setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:false}}) );

                }).catch((err)=>{
                    setOpenModalInfo({open:true,sentence:err.response.data.detail});
                    setErrorValidation(true);
                    setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:true}}) );
                });
        }else{
            await getValidationCodiceSdiEnte(token,profilo.nonce,{codiceSDI:datiFatturazione.codiceSDI})
                .then((res)=>{
                    setErrorValidation(false);
                    setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:false}}) );

                }).catch((err)=>{
                    setOpenModalInfo({open:true,sentence:err.response.data.detail});
                    setErrorValidation(true);
                    setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:true}}) );
                });
        }
       
    } ;
    /*
    useEffect(()=>{
        if(keyObject === 'codiceSDI'){
            const timer = setTimeout(() => {
                if((datiFatturazione.codiceSDI||'').length >= 3){ 
                    sdiIsValid ();
                }
            }, 500);
            return () => clearTimeout(timer);
        }
        
    },[datiFatturazione.codiceSDI]);
*/
    useEffect(()=>{
        if(keyObject === 'codiceSDI' && mainState.statusPageDatiFatturazione === 'mutable' && mainState.datiFatturazione){
            validationSDI(dataValidation.max,dataValidation.validation ,value);
        }
    },[mainState.statusPageDatiFatturazione]);
    //logica aggiunta pe lo SDI 19/11 end
    
    
    const validationTextArea = (max: number, validation:string, input:string|number)=>{
        
        YupString.max(max, validation).matches(/^[a-zA-Z0-9]*$/,  {
            message: "Non è possibile inserire caratteri speciali",
            excludeEmptyString: true
        }).validate(input)
            .then(()=>{
            
                setErrorValidation(false);
                setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:false}}) );
            })
            .catch(() =>{
                setErrorValidation(true);
                setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:true}}) );
            } );
    }; 

    const validationSDI = (max: number, validation:string, input:string|number)=>{
        YupString.max(max, validation).matches(/^[A-Z0-9]*$/,  {
            message: "Non è possibile inserire caratteri speciali"
        }).required().validate(input)
            .then(()=>{
                sdiIsValid(); 
            })
            .catch(() =>{
                setErrorValidation(true);
                setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:true}}) );
            } );
    }; 
    
    const validationTextAreaEmail = (element:string)=>{
        _YupPec.validate(element)
            .then(()=>{
                setErrorValidation(false);
                setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:false}}) );
            })
            .catch(()=> {
                setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:true}}) );
                setErrorValidation(true);
            } );
    }; 
    
    const validationIdDocumento = (max: number, validation:string, input:string|number) => {
        YupString.max(max, validation).matches(/^[a-zA-Z0-9/._\-\s]*$/,  {
            message: "Non è possibile inserire caratteri speciali"
        }).validate(input).then(()=>{
            if(datiFatturazione.cup !== '' && datiFatturazione.idDocumento === ''){
                setErrorValidation(true);
                setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:true}}) );
            }else{
                setErrorValidation(false);
                setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:false}}) );
            }
        }).catch(() =>{
            setErrorValidation(true);
            setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:true}}) );
        } );
    };

    const validationCodCommessa = (max: number, validation:string, input:string|number) => {
        YupString.max(max, validation).matches(/^[a-zA-Z0-9/._\-\s]*$/,  {
            message: "Non è possibile inserire caratteri speciali"
        }).validate(input).then(()=>{
            setErrorValidation(false);
            setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:false}}) );
        }).catch(() =>{
            setErrorValidation(true);
            setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:true}}) );
        } );
    };
    
    const hendleOnMouseOut = (e: React.SyntheticEvent<EventTarget>) =>{
        e.persist();
        if(keyObject === 'pec'){
            validationTextAreaEmail(value);
        }else if(keyObject ==='idDocumento'){
            validationIdDocumento(dataValidation.max,dataValidation.validation ,value);
        }else if(keyObject === 'codiceSDI'){
            validationSDI(dataValidation.max,dataValidation.validation ,value);
        }else if(keyObject === 'codCommessa'){
            validationCodCommessa(dataValidation.max,dataValidation.validation ,value);
        }else{
            validationTextArea(dataValidation.max,dataValidation.validation ,value);
        }

        
    };
    
    let makeTextInputDisable = true;
    if(mainState.statusPageDatiFatturazione === 'immutable'){
        makeTextInputDisable = true;
    }else if(mainState.statusPageDatiFatturazione === 'mutable' && datiFatturazione.tipoCommessa === ''){
        makeTextInputDisable = true;
    }else if(mainState.statusPageDatiFatturazione === 'mutable' && datiFatturazione.tipoCommessa !== ''){
        makeTextInputDisable = false;
    }
    
    return (
        <TextField
            required={required}
            helperText={helperText}
            label={label}
            placeholder={placeholder}
            fullWidth={fullWidth}
            disabled={makeTextInputDisable}
            value={value}
            autoComplete='off'
            error={errorValidation}
            onChange={(e)=>{setDatiFatturazione((prevState: DatiFatturazione) =>{
                let val = e.target.value;
                if(keyObject === 'codiceSDI'){
                    val = val.toLocaleUpperCase();
                }
                const newValue = {[keyObject]:val};
                const newState = {...prevState, ...newValue};
                return newState;
            } );}}
            onBlur={(e)=> hendleOnMouseOut(e)}
            onFocus={()=> setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:true}}) )}
        />
   
       
    );
};

export default TextFieldComponent;
