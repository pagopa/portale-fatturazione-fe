import React from 'react';
import {
  TextField,
} from '@mui/material';

interface TextFieldProps {
  helperText : string,
  label : string,
  placeholder : string,
  fullWidth : boolean
}

const TextFieldComponent : React.FC<TextFieldProps> = props => {
  const {
    helperText, label, placeholder, fullWidth,
  } = props;
  return (

    <TextField
      helperText={helperText}
      label={label}
      placeholder={placeholder}
      fullWidth={fullWidth}
    />

  );
};

export default TextFieldComponent;
