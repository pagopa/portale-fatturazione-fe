import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { Box } from "@mui/system";
import { SelectMeseProps } from "../../types/typesGeneral";

const SelectTipologiaFattura : React.FC<SelectMeseProps> = ({setValue, values}) =>{

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
                        setValue((prev)=> ({...prev, ...{tipologiaFattura:e.target.value}}));
                    }}
                               
                    value={values.tipologiaFattura}
                             
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



