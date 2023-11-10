import React, { useEffect, useState } from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

type OptinsRadio = {
    id: string,
    descrizione: string
}


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
interface RadioComponentProps {
    valueRadio? : string 
    label?: string,
    setDatiFatturazione: any,
    options:OptinsRadio[],
    status:string,
    keyObject:string
 

}

const  RadioComponent: React.FC<RadioComponentProps> = (props) => {
    const {
        label, options, status, valueRadio, setDatiFatturazione,keyObject
    } = props;

 



    return (
        <FormControl>
            <FormLabel id="demo-row-radio-buttons-group-label">{label}</FormLabel>
            <RadioGroup
                row
                aria-labelledby="demo-row-radio-buttons-group-label"
                name="row-radio-buttons-group"
                onChange={(e)=>{setDatiFatturazione((prevState: DatiFatturazione) =>{
                    const newValue = {[keyObject]:e.target.value};
                    const newState = {...prevState, ...newValue};
                    console.log({newState});
                    return newState;
                } );}}>
                {options.map((el:OptinsRadio) => (

                    <FormControlLabel  key={Math.random()} value={el.id} control={<Radio checked={el.id === valueRadio} disabled={status === 'immutable' ? true : false} />} label={el.descrizione} />
                )
          
                )}

            </RadioGroup>
        </FormControl>
    );
};

export default RadioComponent;
