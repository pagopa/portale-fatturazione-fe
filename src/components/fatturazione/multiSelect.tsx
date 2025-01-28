import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { Checkbox } from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { MultiSelectFatturazioneProps } from '../../types/typeFatturazione';




const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const MultiSelectFatturazione : React.FC<MultiSelectFatturazioneProps> =  ({setBody,list,value,setValue,clearOnChangeFilter}) => {


    return (
        <Autocomplete
            sx={{width:'80%',marginLeft:'20px'}}
            multiple
            onChange={(event, value) => {
                setValue(value);
                setBody((prev) => ({...prev,...{tipologiaFattura:value}}));
                clearOnChangeFilter();
            }}
            id="checkboxes-tipologie"
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
            style={{ width: '80%',height:'59px' }}
            renderInput={(params) => {
                
                return <TextField {...params}
                    label="Tipologia Fattura" 
                    placeholder="Tipologia Fattura" />;
            }}
           
        />
    );
};
export default MultiSelectFatturazione;

