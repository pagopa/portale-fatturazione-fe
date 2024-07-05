import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { Box } from "@mui/system";
import { SelectMeseProps } from "../../../types/typesGeneral";
import { mesi } from "../../../reusableFunction/reusableArrayObj";

const SelectMese : React.FC<SelectMeseProps> = ({setValue, values, getTipologia}) =>{

    return (
        <Box sx={{width:'80%', marginLeft:'20px'}}  >
            <FormControl
                fullWidth
                size="medium"
            >
                <InputLabel
                    id="sea"
                >
                                Mese   
                </InputLabel>
                <Select
                    id="sea"
                    label='Seleziona Prodotto'
                    labelId="search-by-label"
                    onChange={(e) =>{
                                    
                        const value = Number(e.target.value);
                        setValue((prev)=> ({...prev, ...{mese:value}}));
                        if(getTipologia){
                            getTipologia(e.target.value, values.anno);
                        }
                        
                    }}         
                    value={values.mese||''}  
                    disabled={status=== 'immutable' ? true : false}            
                >
                    {mesi.map((el) => (
                                    
                        <MenuItem
                            key={Math.random()}
                            value={Object.keys(el)[0].toString()}
                        >
                            {Object.values(el)[0]}
                        </MenuItem>
                                    
                    ))}
                                    
                </Select>
            </FormControl>
        </Box>
    );
};

export default SelectMese;
