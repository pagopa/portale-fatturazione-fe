import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { Box } from "@mui/system";
import { BodyRel } from "../../types/typeRel";
interface SelecTipologiaProps{
    setValue: any,
    values:BodyRel
}



const SelectTipologiaFattura : React.FC<SelecTipologiaProps> = ({setValue, values}) =>{

    const tipologie = [
        'PRIMO SALDO',
        'SECONDO SALDO',
        'PRIMO CONGUAGLIO',
        'SECONDO CONGUAGLIO'];
    return (
        <Box sx={{width:'80%', marginLeft:'20px'}}  >
            <FormControl
                fullWidth
                size="medium"
            >
                <InputLabel
                    id="sea"
                >
                                Tipologia Fatture  
                </InputLabel>
                <Select
                    id="sea"
                    label='Seleziona Prodotto'
                    labelId="search-by-label"
                    onChange={(e) =>{
                        setValue((prev)=> ({...prev, ...{tipologiaFatture:e.target.value}}));
                    }}
                               
                    value={values.tipologiaFatture || ''}
                             
                >
                    {tipologie.map((el) => (
                                    
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



