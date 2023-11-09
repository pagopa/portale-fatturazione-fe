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


interface RadioComponentProps {
  valueRadio? : string 
  label?: string,
  setValueRadio: any,
  options:OptinsRadio[],
  status:string,
 

}

const  RadioComponent: React.FC<RadioComponentProps> = (props) => {
  const {
   label, options, status, valueRadio, setValueRadio
  } = props;

  console.log('radio');



  return (
    <FormControl>
      <FormLabel id="demo-row-radio-buttons-group-label">{label}</FormLabel>
      <RadioGroup
        row
        aria-labelledby="demo-row-radio-buttons-group-label"
        name="row-radio-buttons-group"
        onChange={(e) =>setValueRadio(e.target.value)}>
        {options.map((el:OptinsRadio) => (

        <FormControlLabel  key={Math.random()} value={el.id} control={<Radio checked={el.id === valueRadio} disabled={status === 'immutable' ? true : false} />} label={el.descrizione} />
        )
          
        )}

      </RadioGroup>
    </FormControl>
  );
};

export default RadioComponent;
