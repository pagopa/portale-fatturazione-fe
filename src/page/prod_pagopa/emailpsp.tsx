import { Autocomplete, Box, Button, Checkbox, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import { AutocompleteMultiselect, OptionMultiselectCheckboxPsp, OptionMultiselectCheckboxQarter } from "../../types/typeAngraficaPsp";
import MultiselectWithKeyValue from "../../components/anagraficaPsp/multiselectKeyValue";
import useSavedFilters from "../../hooks/useSaveFiltersLocalStorage";
import { PathPf } from "../../types/enum";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { useState } from "react";

export interface RequestBodyMailPsp{
    contractIds: string[],
    quarters: string[],
    year: string
}

const EmailPsp = () => {

    const { 
        filters,
        updateFilters,
        resetFilters,
        isInitialRender
    } = useSavedFilters(PathPf.EMAIL_PSP,{});

    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;

    const [bodyGetLista, setBodyGetLista] = useState<RequestBodyMailPsp>({
        contractIds: [],
        quarters: [],
        year: ''
    });
    const [yearOnSelect,setYearOnSelect] = useState<string[]>([]);
    const [valueQuarters, setValueQuarters] = useState<OptionMultiselectCheckboxQarter[]>([]);
    const [dataSelect, setDataSelect] = useState<OptionMultiselectCheckboxPsp[]>([]);
    const [dataSelectQuarter, setDataSelectQuarter] = useState<OptionMultiselectCheckboxQarter[]>([]);
    const [valueAutocomplete, setValueAutocomplete] = useState<AutocompleteMultiselect[]>([]);
    const [textValue, setTextValue] = useState<string>('');

    
    const clearOnChangeFilter = () => {
        console.log("clear");
    };


    return (
        <div className="mx-5">
            {/*title container start */}
            <div className="d-flex marginTop24 ">
                <div className="col-9">
                    <Typography variant="h4">Invio email PSP</Typography>
                </div>
               
            </div>
            <div className="row mb-5 mt-5" >
                <div className="col-3">
                    <Box sx={{width:'80%'}} >
                        <FormControl
                            fullWidth
                            size="medium"
                        >
                            <InputLabel
                                id="Anno_doc_contabili"
                            >
                                            Anno
                            </InputLabel>
                            <Select
                                id="Anno_doc_contabili"
                                label='Anno'
                                labelId="search-by-label"
                                onChange={(e) =>{
                                    clearOnChangeFilter(); 
                                    setBodyGetLista((prev) => ({...prev,...{year:e.target.value}}));
                                }}
                                value={bodyGetLista.year}
                            >
                                {yearOnSelect.map((el) => (
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
                </div>
                <div className="col-3">
                    <Autocomplete
                        multiple
                        limitTags={1}
                        onChange={(event, value) => {
                            const arrayId = value.map(el => el.value);
                            setBodyGetLista((prev) => ({...prev,...{quarters:arrayId}}));
                            setValueQuarters(value);
                            clearOnChangeFilter(); 
                        }}
                        id="checkboxes-quarters"
                        options={dataSelectQuarter}
                        value={valueQuarters}
                        disableCloseOnSelect
                        isOptionEqualToValue={(option, value) => option.value === value.value}
                        getOptionLabel={(option:OptionMultiselectCheckboxQarter) => {
                            return option.quarter;}}
                        renderOption={(props, option,{ selected }) =>(
                            <li {...props}>
                                <Checkbox
                                    icon={icon}
                                    checkedIcon={checkedIcon}
                                    style={{ marginRight: 8 }}
                                    checked={selected}
                                />
                                {option.quarter}
                            </li>
                        )}
                        style={{ width: '80%',height:'59px' }}
                        renderInput={(params) => {
                            
                            return <TextField {...params}
                                sx={{backgroundColor:"#F2F2F2"}}
                                label="Trimestre" 
                                placeholder="Trimestre" />;
                        }}
                    />
                </div>
                <div  className="col-3">
                    <MultiselectWithKeyValue 
                        setBodyGetLista={setBodyGetLista}
                        clearOnChangeFilter={clearOnChangeFilter}
                        setValueAutocomplete={setValueAutocomplete}
                        dataSelect={dataSelect}
                        valueAutocomplete={valueAutocomplete}
                        setTextValue={setTextValue}
                        keyId={"contractId"}
                        valueId={'name'}
                        label={"Nome PSP"} 
                        keyArrayName={"contractIds"}/>
                </div>
            </div>
        </div>
    );
};

export default EmailPsp;