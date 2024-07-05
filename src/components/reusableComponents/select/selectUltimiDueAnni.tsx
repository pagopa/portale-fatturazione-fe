import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import { SelectUltimiDueAnniProps } from "../../../types/typesGeneral";
import { getCurrentFinancialYear } from "../../../reusableFunction/function";

const SelectUltimiDueAnni : React.FC<SelectUltimiDueAnniProps> = ({setValue, values, getTipologia}) =>{
    return (
        <Box sx={{width:'80%'}} >
            <FormControl
                fullWidth
                size="medium"
            >
                <InputLabel
                    id="sea"
                >
                            Anno
                            
                </InputLabel>
                <Select
                    id="selectAnno"
                    label='Seleziona Prodotto'
                    labelId="search-by-label"
                    onChange={(e) => {
                                
                        const value = Number(e.target.value);
                        setValue((prev)=> ({...prev, ...{anno:value}}));
                        if(getTipologia){
                            getTipologia(values.mese,e.target.value);
                        }
                    }}
                    value={values.anno}
                    //IconComponent={SearchIcon}
                            
                    disabled={status=== 'immutable' ? true : false}
                            
                >
                    {getCurrentFinancialYear().map((el) => (
                                
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