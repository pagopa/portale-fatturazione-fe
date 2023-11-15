import React from 'react';
import {
    Box, FormControl, InputLabel,
    Select, MenuItem,
} from '@mui/material';
import { useState, useEffect } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
interface SelectProps {
    inputLabel : string,
    showIcon : boolean,
    status? : string,
    inputElements?: number|string[]
}
interface TipoContratto {
    id: number,
    descrizione : string
 
}

const SelectComponet: React.FC<SelectProps> = (props) => {
    const [element, setElement] = useState('');
    const { inputLabel, showIcon, status} = props;

    const [tipoContratto, setTipoContratto] = useState<TipoContratto[]>([{id:0, descrizione:''}]);

    const getAllTipoContratto  = async () => {
        const response = await axios.get(
            `https://portalefatturebeapi20231102162515.azurewebsites.net/api/datifatturazione/tipocontratto`).then( (res) => {
            setTipoContratto(res.data);
    
            return res.data;
        });
    };

    useEffect(()=>{

    
        getAllTipoContratto();

  
    }, []);


 




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
                    disabled={status=== 'immutable' ? true : false}

                >
                    {tipoContratto.map((el) => (

                        <MenuItem
                            key={Math.random()}
                            value={el.id}
                        >
                            {el.descrizione}
                        </MenuItem>

                    ))}

                </Select>
            </FormControl>
        </Box>

    );
};

export default SelectComponet;