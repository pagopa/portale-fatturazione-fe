import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { Box } from "@mui/system";
import { BodyRel } from "../../types/typeRel";
interface SelecTipologiaPdf{
    setValue: any,
    values:BodyRel
}

const SelectStatoPdf : React.FC<SelecTipologiaPdf> = ({setValue, values}) =>{

    const statoPdf = [
        'Non Caricata',
        'Firmata',
        'Invalidato'
    ];
    return (
        <Box sx={{width:'80%', marginLeft:'20px'}}  >
            <FormControl
                fullWidth
                size="medium"
            >
                <InputLabel
                    id="sea"
                >
                               Stato Pdf Reg. Es. 
                </InputLabel>
                <Select
                    id="RegPdf"
                    label='Seleziona Prodotto'
                    labelId="search-by-label"
                    onChange={(e) =>{
                        setValue((prev)=> ({...prev, ...{caricata:Number(e.target.value)}}));
                    }}         
                    value={values.caricata ? values.caricata.toString() :''}                  
                >
                    {statoPdf.map((el,i) => (       
                        <MenuItem
                            key={i}
                            value={i.toString()}
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
