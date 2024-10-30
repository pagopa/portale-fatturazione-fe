import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { Box } from "@mui/system";
import { BodyRel } from "../../types/typeRel";
import { Dispatch, SetStateAction } from "react";
interface SelecTipologiaPdf{
    setValue: Dispatch<SetStateAction<BodyRel>>,
    values:BodyRel
}

const SelectStatoPdf : React.FC<SelecTipologiaPdf> = ({setValue, values}) =>{

    const statoPdf = [
        'Non Caricata',
        'Firmata',
        'Invalidata'
    ];

  
    return (
        <Box sx={{width:'80%', marginLeft:'20px'}}  >
            <FormControl
                fullWidth
                size="medium"
            >
                <InputLabel
                    id="RegPdf"
                >
                               Stato PDF Reg. Es. 
                </InputLabel>
                <Select
                    id="RegPdf"
                    label='Seleziona Prodotto'
                    labelId="search-by-label"
                    onChange={(e) =>{
                        setValue((prev)=> ({...prev, ...{caricata:Number(e.target.value)}}));
                    }}         
                    value={values.caricata?.toString() ||  ''}                  
                >
                    {statoPdf.map((el,i) => (       
                        <MenuItem
                            key={Math.random()}
                            value={i}
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
