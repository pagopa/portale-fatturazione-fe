import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { Box } from "@mui/system";
import { SelectMeseProps } from "../../types/typesGeneral";

const SelectMese : React.FC<SelectMeseProps> = ({setValue, values}) =>{

    const mesi = [
        {1:'Gennaio'},{2:'Febbraio'},{3:'Marzo'},{4:'Aprile'},{5:'Maggio'},{6:'Giugno'},
        {7:'Luglio'},{8:'Agosto'},{9:'Settembre'},{10:'Ottobre'},{11:'Novembre'},{12:'Dicembre'}];

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
                    }}
                                
                                
                    value={values.mese}
                    //IconComponent={SearchIcon}
                                
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



