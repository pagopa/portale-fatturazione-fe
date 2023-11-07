import React from 'react';
import {
  InputLabel, Typography,
} from '@mui/material';

interface LabelProps{
  label: string,
  input : string
}

const LabelComponent : React.FC<LabelProps> = ({ label, input }) => {
  return (
    <div className="d-flex">
      <InputLabel sx={{ marginRight: '20px' }} size={"normal"}>{label}</InputLabel>
      <Typography>{input}</Typography>
    </div>
  );
};

export default  LabelComponent;