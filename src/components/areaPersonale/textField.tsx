import React, {useState,useEffect} from 'react';
import {TextField,} from '@mui/material';
import {DatiFatturazione, TextFieldProps, StateEnableConferma}  from '../../types/typesAreaPersonaleUtenteEnte';
import { _YupPec} from '../../validations/email/index';
import YupString from '../../validations/string/index';

const TextFieldComponent : React.FC<TextFieldProps> = props => {

    const {
        helperText, label, placeholder, fullWidth,value,keyObject, dataValidation, required,mainState,setDatiFatturazione,setStatusButtonConferma, datiFatturazione
    } = props;
  
    const [errorValidation, setErrorValidation] = useState(false);

    // ogni qual volta csul click indietro richaimo i dati di fatturazione e setto tutti gli errori a false
    useEffect(()=>{
        setErrorValidation(false);
    },[mainState]);
    
   

    const validationTextArea = (max: number, validation:string, input:string|number)=>{
        YupString.max(max, validation)
            .validate(input)
            .then(()=>{
                setErrorValidation(false);
                setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:false}}) );
            })
            .catch(() =>{
                setErrorValidation(true);
                setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:true}}) );
            } );

        YupString.matches(/^[a-zA-Z0-9_.-]*$/,  {
            message: "Non è possibile inserire caratteri speciali",
            excludeEmptyString: true
        }).validate(input)
            .then(()=>{
                setErrorValidation(false);
                setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:false}}) );
            }).catch(() =>{
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
      
        YupString.max(max, validation)
            .validate(input)
            .then(()=>{
                setErrorValidation(false);
                setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:false}}) );
            })
            .catch(() =>{
                setErrorValidation(true);
                setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:true}}) );
            } );
    };

    const hendleOnMouseOut = (e: React.SyntheticEvent<EventTarget>) =>{
        e.persist();
        if(label === 'Mail Pec'){
            validationTextAreaEmail(value);
        }else if(label === "ID Documento" || label === "Codice Commessa/Convenzione"){
            validationIdDocumento(dataValidation.max,dataValidation.validation ,value);
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
            error={errorValidation}
            onChange={(e)=>{setDatiFatturazione((prevState: DatiFatturazione) =>{
                const newValue = {[keyObject]:e.target.value};
                const newState = {...prevState, ...newValue};
                return newState;
            } );}}
            onBlur={(e)=> hendleOnMouseOut(e)}
        />
    );
};

export default TextFieldComponent;
