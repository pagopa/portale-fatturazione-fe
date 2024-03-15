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
    console.log(values, statoPdf[0]);
    const caricata = values.caricata || null;
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
                        setValue((prev)=> ({...prev, ...{caricata:e.target.value}}));
                    }}         
                    value={caricata?.toString() ||  ''}                  
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
