import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { Checkbox } from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { BodyListaNotifiche} from '../../types/typesGeneral';
import { MultiSelectFatturazioneProps } from '../../types/typeFatturazione';
import { useEffect, useState } from 'react';
import { getTipologieFaPagoPa } from '../../api/apiPagoPa/fatturazionePA/api';
import { getToken } from '../../reusableFunction/actionLocalStorage';
import { manageError } from '../../api/api';


const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const MultiSelectFatturazione : React.FC<MultiSelectFatturazioneProps> =  ({setBody,list,value,setValue}) => {


    return (
        <Autocomplete
            multiple
            onInputChange={(event, newInputValue) => {
                console.log({event, newInputValue});
            }}
            onChange={(event, value,reason) => {
                setValue(value);
                setBody((prev) => ({...prev,...{tipologiaFattura:value}}));

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
            style={{ width: '80%' }}
            renderInput={(params) => {
                
                return <TextField {...params}
                    label="Tipologia Fattura" 
                    placeholder="Tipologia Fattura" />;
            }}
           
        />
    );
};
export default MultiSelectFatturazione;
