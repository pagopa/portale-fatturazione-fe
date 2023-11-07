import React from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

interface RadioComponentProps {
  valueRadio : string,
  label?: string,
  setValueRadio: any,
  options: string [],
}

const  RadioComponent: React.FC<RadioComponentProps> = (props) => {
  const {
    valueRadio, label, setValueRadio, options,
  } = props;

  return (
    <FormControl>
      <FormLabel id="demo-row-radio-buttons-group-label">{label}</FormLabel>
      <RadioGroup
        row
        aria-labelledby="demo-row-radio-buttons-group-label"
        name="row-radio-buttons-group"
        onChange={(e) => setValueRadio(e.target.value)}
        value={valueRadio}

      >
        {options.map((el) => (
          <FormControlLabel key={Math.random()} value={el} control={<Radio />} label={el} />
        ))}

      </RadioGroup>
    </FormControl>
  );
};

export default RadioComponent;
