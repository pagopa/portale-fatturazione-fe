import React from 'react';
import {
  TextField,
} from '@mui/material';

interface TextFieldProps {
  helperText : string,
  label : string,
  placeholder : string,
  fullWidth : boolean,
  status : string,
  value : string,

}

const TextFieldComponent : React.FC<TextFieldProps> = props => {
  const {
    helperText, label, placeholder, fullWidth, status, value,
  } = props;
console.log('Textfield');
  return (

    <TextField
      helperText={helperText}
      label={label}
      placeholder={placeholder}
      fullWidth={fullWidth}
      disabled={status === 'immutable'? true : false}
      value={value|| ''}
      
    
      
    />

  );
};

export default TextFieldComponent;
