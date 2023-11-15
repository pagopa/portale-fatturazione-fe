import React, {useState, useContext} from 'react';
import {TextField,} from '@mui/material';
import {DatiFatturazione, TextFieldProps, StateEnableConferma,AreaPersonaleContext}  from '../types/typesAreaPersonaleUtenteEnte';
import { DatiFatturazioneContext } from '../page/areaPersonaleUtenteEnte';
import { _YupEmail} from '../validations/email/index';
import YupString from '../validations/string/index';

const TextFieldComponent : React.FC<TextFieldProps> = props => {
    const {statusPage,setDatiFatturazione,setStatusBottmConferma} = useContext<AreaPersonaleContext>(DatiFatturazioneContext);

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
  
    return (

        <TextField
            helperText={helperText}
            label={label}
            placeholder={placeholder}
            fullWidth={fullWidth}
            disabled={statusPage === 'immutable'? true : false}
            value={value}
            error={errorValidation}
            onChange={(e)=>{setDatiFatturazione((prevState: DatiFatturazione) =>{
                const newValue = {[keyObject]:e.target.value};
                const newState = {...prevState, ...newValue};
                console.log({newState});
                return newState;
            } );}}
            onMouseOut={(e) => hendleOnMouseOut(e)}
            
           
      
    
      
        />

    );
};

export default TextFieldComponent;
