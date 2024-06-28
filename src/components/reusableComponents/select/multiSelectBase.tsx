import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { Checkbox } from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { MultiSelectBaseProps } from '../../../types/typesGeneral';




const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const MultiSelectBase : React.FC<MultiSelectBaseProps> =  ({setBody,list,value,setValue,label,placeholder}) => {


    return (
        <Autocomplete
            multiple
            onChange={(event, value,reason) => {
                setValue(value);
                setBody((prev) => ({...prev,...{tipologiaDocumento:value}}));

            }}
            id="checkboxes-tipologie-documento"
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
            style={{ width: '80%' }}
            renderInput={(params) => {
                
                return <TextField {...params}
                    label={label} 
                    placeholder={placeholder} />;
            }}
           
        />
    );
};
export default MultiSelectBase;
