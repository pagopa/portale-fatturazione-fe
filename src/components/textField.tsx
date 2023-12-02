import React, {useState, useContext} from 'react';
import {TextField,} from '@mui/material';
import {DatiFatturazione, TextFieldProps, StateEnableConferma,AreaPersonaleContext}  from '../types/typesAreaPersonaleUtenteEnte';
import { DatiFatturazioneContext } from '../page/areaPersonaleUtenteEnte';
import { _YupEmail} from '../validations/email/index';
import YupString from '../validations/string/index';

const TextFieldComponent : React.FC<TextFieldProps> = props => {
    const {infoModuloCommessa,setDatiFatturazione,setStatusBottmConferma, datiFatturazione} = useContext<AreaPersonaleContext>(DatiFatturazioneContext);

    const [errorValidation, setErrorValidation] = useState(false);
    const {
        helperText, label, placeholder, fullWidth,value,keyObject, dataValidation
    } = props;

    const validationTextArea = (max: number, validation:string, input:string|number)=>{
        YupString.max(max, validation)
            .validate(input)
            .then(()=>{
                setErrorValidation(false);
                setStatusBottmConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:false}}) );
            })
            .catch(() =>{
                setErrorValidation(true);
                setStatusBottmConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:true}}) );
            } );

        YupString.matches(/^[a-zA-Z0-9_.-]*$/,  {
            message: "Non è possibile inserire caratteri speciali",
            excludeEmptyString: true
        }).validate(input)
            .then(()=>{
                setErrorValidation(false);
                setStatusBottmConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:false}}) );
            }).catch(() =>{
                setErrorValidation(true);
                setStatusBottmConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:true}}) );
            } );
    }; 

    const validationTextAreaEmail = (element:string)=>{
        _YupEmail.validate(element)
            .then(()=>{
                setErrorValidation(false);
                setStatusBottmConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:false}}) );
            })
            .catch(()=> {
                setStatusBottmConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:true}}) );
                setErrorValidation(true);
            } );
    }; 


    const hendleOnMouseOut = (e: React.SyntheticEvent<EventTarget>) =>{
        e.persist();
        if(label === 'Mail Pec'){
            validationTextAreaEmail(value);
           
        }else{
            validationTextArea(dataValidation.max,dataValidation.validation ,value);
           
        }

    };


    let makeTextInputDisable = true;
    if(infoModuloCommessa.statusPageDatiFatturazione === 'immutable'){
        makeTextInputDisable = true;
    }else if(infoModuloCommessa.statusPageDatiFatturazione === 'mutable' && datiFatturazione.tipoCommessa === ''){
        makeTextInputDisable = true;
    }else if(infoModuloCommessa.statusPageDatiFatturazione === 'mutable' && datiFatturazione.tipoCommessa !== ''){
        makeTextInputDisable = false;

    }
  
    return (

        <TextField
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
