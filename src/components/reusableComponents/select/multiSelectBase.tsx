import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { Box, Checkbox } from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { MultiSelectBaseProps } from '../../../types/typesGeneral';




const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const MultiSelectBase : React.FC<MultiSelectBaseProps> =  ({setBody,list,value,setValue,label,placeholder}) => {

    return (
        <Box sx={{width:'80%', marginLeft:'20px'}}  >
            <Autocomplete
                limitTags={1}
                multiple
                fullWidth
                size="medium"
                onChange={(event, value,reason) => {
                    setValue(value);
                    setBody((prev) => ({...prev,...{tipologiaFattura:value}}));

                }}
                options={list}
                value={value}
                disableCloseOnSelect
                getOptionLabel={(option:string) => option}
                renderOption={(props, option,{ selected }) =>(
                    <li {...props}>
                        <Checkbox
                            icon={icon}
                            checkedIcon={checkedIcon}
                            style={{ marginRight: 8 }}
                            checked={selected}
                        />
                        {option}
                    </li>
                )}
                style={{height:'59px'}}
                renderInput={(params) => {
                    return <TextField {...params}
                        sx={{backgroundColor:"#F2F2F2"}}
                        label={label} 
                        placeholder={placeholder} />;
                }}
           
            />
        </Box>
    );
};
export default MultiSelectBase;
