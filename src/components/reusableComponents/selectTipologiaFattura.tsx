import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { Box } from "@mui/system";
interface SelecTipologiaProps{
    setValue: any,
    values:{
        anno:number,
        mese:number|null,
        tipologiaFattura:null| string,
        idEnti?:string[],
        idContratto?:null|string,
        caricata?:null|number
    },
    types:string[]
}

const SelectTipologiaFattura : React.FC<SelecTipologiaProps> = ({setValue, values, types}) =>{

    
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
                        setValue((prev)=> ({...prev, ...{tipologiaFattura:e.target.value}}));
                    }}     
                    value={values.tipologiaFattura || ''}       
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
