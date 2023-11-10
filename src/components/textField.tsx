import React from 'react';
import {
    TextField,
} from '@mui/material';

type Contatti = {
    email: string,
    tipo: number
}
interface DatiFatturazione{
    tipoCommessa:string,
    splitPayment:boolean,
    cup: string,
    cig:string,
    idDocumento:string,
    codCommessa:string,
    contatti: Contatti[],
    dataCreazione:string,
    dataModifica:string,
    dataDocumento:string,
}

interface TextFieldProps {
    helperText : string,
    label : string,
    placeholder : string,
    fullWidth : boolean,
    status : string,
    value : string,
    setDatiFatturazione: any,
    keyObject:string

}

const TextFieldComponent : React.FC<TextFieldProps> = props => {
    const {
        helperText, label, placeholder, fullWidth, status, value, setDatiFatturazione,keyObject
    } = props;


  
    return (

        <TextField
            helperText={helperText}
            label={label}
            placeholder={placeholder}
            fullWidth={fullWidth}
            disabled={status === 'immutable'? true : false}
            value={value}
            onChange={(e)=>{setDatiFatturazione((prevState: DatiFatturazione) =>{
                const newValue = {[keyObject]:e.target.value};
                const newState = {...prevState, ...newValue};
                console.log({newState});
                return newState;
            } );}}
      
    
      
        />

    );
};

export default TextFieldComponent;
