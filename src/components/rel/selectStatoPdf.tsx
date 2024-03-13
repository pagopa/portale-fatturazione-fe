import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { Box } from "@mui/system";
import { BodyRel } from "../../types/typeRel";
interface SelecTipologiaPdf{
    setValue: any,
    values:BodyRel
}

const SelectStatoPdf : React.FC<SelecTipologiaPdf> = ({setValue, values}) =>{

    const statoPdf = {
        1: 'Non Firmato',
        2: 'Caricato',
        3: 'Invalidato'
    };
    return (
        <Box sx={{width:'80%', marginLeft:'20px'}}  >
            <FormControl
                fullWidth
                size="medium"
            >
                <InputLabel
                    id="sea"
                >
                                Reg. Es. Pdf  
                </InputLabel>
                <Select
                    id="RegPdf"
                    label='Seleziona Prodotto'
                    labelId="search-by-label"
                    onChange={(e) =>{
                        setValue((prev)=> ({...prev, ...{caricata:e.target.value}}));
                    }}
                               
                    value={values.caricata || ''}
                             
                >
                    {Object.values(statoPdf).map((el,i) => (
                                    
                        <MenuItem
                            key={i}
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

export default SelectStatoPdf;
