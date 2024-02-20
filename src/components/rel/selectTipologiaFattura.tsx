import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { Box } from "@mui/system";
import { SelectMeseProps } from "../../types/typesGeneral";

const SelectTipologiaFattura : React.FC<SelectMeseProps> = ({setValue, values}) =>{

    const tipologie = [{'id': 1, 'descrizione': 'tipo 1'}];
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
                               
                    value={values.mese}
                             
                >
                    {tipologie.map((el) => (
                                    
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

export default SelectTipologiaFattura;



