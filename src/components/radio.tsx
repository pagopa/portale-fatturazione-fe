import React from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { RadioComponentProps,DatiFatturazione,OptinsRadio }  from '../types/typesAreaPersonaleUtenteEnte';




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
                    let newState;
                    if(e.target.value.toLowerCase() === 'true'){
                        const newValue = {[keyObject]:true};
                        newState = {...prevState, ...newValue};
                    }else if(e.target.value.toLowerCase() === 'false'){
                        const newValue = {[keyObject]:false};
                        newState = {...prevState, ...newValue};
                    }else{
                        const newValue = {[keyObject]:e.target.value};
                        newState = {...prevState, ...newValue};
                    }
                  
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
