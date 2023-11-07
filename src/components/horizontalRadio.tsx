import React from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

interface HorizontalRadioProps {
  valueHorizontalRadio: string | number
  setValueHorizontalRadio : any
}

const HorizontalRadio : React.FC<HorizontalRadioProps> = ({ valueHorizontalRadio, setValueHorizontalRadio }) => {
  return (
    <RadioGroup
      row
      aria-labelledby="demo-row-radio-buttons-group-label"
      name="row-radio-buttons-group"
      onChange={(e) => setValueHorizontalRadio(e.target.value)}
      value={valueHorizontalRadio}
    >
      <FormControlLabel value="Si" control={<Radio />} label="Si" />
      <FormControlLabel value="No" control={<Radio />} label="No" />
    </RadioGroup>
  );
}
