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
    <div className="row">
      <div className='col-6 col-sm-3'>
      <InputLabel sx={{textAlign:'start'}}  size={"normal"}>{label}</InputLabel>
      </div>
      <div className='col-6 col-sm-3'>
      <Typography sx={{textAlign:'start'}} >{input}</Typography>
      </div>
      
      
    </div>
  );
};

export default  LabelComponent;