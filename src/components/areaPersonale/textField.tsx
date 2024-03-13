import React, {useState, useContext} from 'react';
import {TextField,} from '@mui/material';
import {DatiFatturazione, TextFieldProps, StateEnableConferma,AreaPersonaleContext}  from '../../types/typesAreaPersonaleUtenteEnte';
import { DatiFatturazioneContext } from '../../page/areaPersonaleUtenteEnte';
import { _YupPec} from '../../validations/email/index';
import YupString from '../../validations/string/index';

const TextFieldComponent : React.FC<TextFieldProps> = props => {
    const {mainState,setDatiFatturazione,setStatusButtonConferma, datiFatturazione} = useContext<AreaPersonaleContext>(DatiFatturazioneContext);

    const [errorValidation, setErrorValidation] = useState(false);
    const {
        helperText, label, placeholder, fullWidth,value,keyObject, dataValidation, required
    } = props;

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

    const hendleOnMouseOut = (e: React.SyntheticEvent<EventTarget>) =>{
        e.persist();
        if(label === 'Mail Pec'){
            validationTextAreaEmail(value);
           
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
