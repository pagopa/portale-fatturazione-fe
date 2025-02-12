import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { Box } from "@mui/system";
import { Dispatch, SetStateAction } from "react";
import { BodyRel } from "../../../types/typeRel";
import { BodyLista } from "../../../page/listaDocEmessi";
interface SelecTipologiaProps{
    value:string|null,
    types:string[],
    setBody:Dispatch<SetStateAction<BodyRel>>|Dispatch<SetStateAction<BodyLista>>,
    setValue:Dispatch<SetStateAction<string>>,
    clearOnChangeFilter:any
}

const SelectTipologiaFattura : React.FC<SelecTipologiaProps> = ({setValue,value, types, setBody,clearOnChangeFilter}) =>{

   
    return (
        <Box sx={{width:'80%', marginLeft:'20px'}}  >
            <FormControl
                fullWidth
                size="medium"
            >
                <InputLabel
                    id="sea"
                >
                                Tipologia Fattura  
                </InputLabel>
                <Select
                    id="sea"
                    label='Seleziona Prodotto'
                    labelId="search-by-label"
                    onChange={(e) =>{
                        if(e.target.value){
                            setValue(e.target.value);
                            setBody((prev)=>({...prev,...{tipologiaFattura:e.target.value}}));
                        }
                        clearOnChangeFilter();
                    }}     
                    value={value}       
                >
                    {types.map((el) => (            
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

export default SelectTipologiaFattura;
