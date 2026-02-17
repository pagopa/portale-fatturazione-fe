import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import { SelectUltimiDueAnniProps } from "../../../types/typesGeneral";
import { get2FinancialYear} from "../../../reusableFunction/function";

const SelectUltimiDueAnni : React.FC<SelectUltimiDueAnniProps> = ({setValue, values, getTipologia,clearOnChangeFilter}) =>{
    return (
        <Box sx={{width:'80%'}} >
            <FormControl
                fullWidth
                size="medium"
            >
                <InputLabel>
                            Anno   
                </InputLabel>
                <Select
                    label='Anno'
                    onChange={(e) => {
                        if(clearOnChangeFilter){
                            clearOnChangeFilter(); 
                        }
                        const value = Number(e.target.value);
                        setValue((prev)=> ({...prev, ...{anno:value}}));
                        if(getTipologia){
                            getTipologia(values.mese,e.target.value);
                        }
                    }}
                    value={values.anno||''}     
                >
                    {get2FinancialYear().map((el) => (
                                
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

export default SelectUltimiDueAnni;