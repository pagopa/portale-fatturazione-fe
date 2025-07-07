import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { Box } from "@mui/system";
import { Dispatch, SetStateAction } from "react";
import { BodyRel } from "../../../types/typeRel";
import { BodyWhite } from "../../../api/apiPagoPa/whiteListPA/whiteList";
import { BodyLista } from "../../../page/prod_pn/whiteList";
interface SelecTipologiaProps{
    value:string|null,
    types:string[],
    setBody:Dispatch<SetStateAction<BodyRel>>|Dispatch<SetStateAction<BodyLista>>|Dispatch<SetStateAction<BodyWhite>>,
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
                >
                                Tipologia Fattura  
                </InputLabel>
                <Select
                    label='Seleziona Prodotto'
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
