import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { Box } from "@mui/system";
interface SelecTipologiaProps{
    value:string|null,
    types:string[],
    setBody:any,
    setValue:any
}

const SelectTipologiaFattura : React.FC<SelecTipologiaProps> = ({setValue,value, types, setBody}) =>{

   
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
                        setValue(e.target.value);
                        setBody((prev)=>({...prev,...{tipologiaFattura:e.target.value}}));
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
