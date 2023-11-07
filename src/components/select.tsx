import React from 'react';
import {
  Box, FormControl, InputLabel,
  Select, MenuItem,
} from '@mui/material';
import { useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';

interface SelectProps {
  inputLabel : string,
   inputElements: string [],
    showIcon : boolean,
}

const SelectComponet: React.FC<SelectProps>= (props) => {
  const [element, setElement] = useState('');
  const { inputLabel, inputElements, showIcon } = props;

  let iconCom; 
  if(showIcon){
iconCom = SearchIcon;
  }

  return (
    <Box sx={{ width: 300 }}>
      <FormControl
        fullWidth
        size="medium"
      >
        <InputLabel
          id="sea"
        >
          {inputLabel}

        </InputLabel>
        <Select
          id="sea"
          label={inputLabel}
          labelId="search-by-label"
          onChange={(e) => setElement(e.target.value)}
          value={element || ''}
          IconComponent={iconCom}

        >
          {inputElements.map((el) => (

            <MenuItem
              key={Math.random()}
              value={el}
            >
              {el}
            </MenuItem>

          ))}

        </Select>
      </FormControl>
    </Box>

  );
};

export default SelectComponet;