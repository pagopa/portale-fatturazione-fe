import { Autocomplete, Checkbox, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { Dispatch, SetStateAction } from "react";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { it } from "date-fns/locale";
import { formatDateToValidation, isDateInvalid } from "../../reusableFunction/function";
import { ElementMultiSelect, OptionMultiselectChackbox } from "../../types/typeReportDettaglio";
import MultiselectCheckbox from "../reportDettaglio/multiSelectCheckbox";

type MainFilterProps =  {
    filterName: string,
    clearOnChangeFilter:() => void,
    setBody:Dispatch<SetStateAction<any>>,
    body:any,
    arrayValues?:any[],
    inputLabel?:string,
    keyInput:string,
    keyCompare:string,
    error?:boolean,
    setError?:Dispatch<SetStateAction<boolean>>,
    dataSelect?:ElementMultiSelect[],
    setTextValue?:Dispatch<SetStateAction<string>>,
    valueAutocomplete?:OptionMultiselectChackbox[],
    setValueAutocomplete?:Dispatch<SetStateAction<OptionMultiselectChackbox[]>>

}

const MainFilter  = ({
    filterName,
    inputLabel,
    clearOnChangeFilter,
    setBody,
    body,
    arrayValues,
    keyInput,
    keyCompare,
    error,
    setError,
    dataSelect,
    setTextValue,
    valueAutocomplete,
    setValueAutocomplete
}:MainFilterProps) => {

    switch (filterName) {
        case "select_key_value":  //case "select_prodotto":case "select_profilo":case "select_anno":case "select_mese":consolidatore recapitista
            return (  <Grid item xs={12} sm={6} md={3}>
                <FormControl sx={{width:"80%"}}>
                    <InputLabel>
                        {inputLabel}
                    </InputLabel>
                    <Select
                        label={inputLabel}
                        onChange={(e) =>{
                            clearOnChangeFilter();
                            setBody((prev)=> ({...prev, ...{[keyInput]:e.target.value}}));
                        }}
                        value={body[keyInput]}
                    >
                        {arrayValues?.map((el) => (
                            <MenuItem
                                key={Math.random()}
                                value={el[keyInput]||''}
                            >
                                {el[keyInput]}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>);
        case "input_text":  //"input_iun":case "input_cup":case "input_recipient_id":
            return ( <Grid item xs={12} sm={6} md={3}> 
                <TextField
                    sx={{width:"80%"}}
                    label={inputLabel}
                    placeholder={inputLabel}
                    value={body[keyInput] || ''}
                    onChange={(e) =>{
                        clearOnChangeFilter();
                        setBody((prev)=>{             
                            if(e.target.value === ''){
                                return {...prev, ...{[keyInput]:null}};
                            }else{
                                return {...prev, ...{[keyInput]:e.target.value}};
                            }
                        });}
                    }            
                /> </Grid>);
        case "date_from_to": 
            return ( <Grid item xs={12} sm={6} md={3}> 
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={it}>
                    <DesktopDatePicker
                        sx={{width:"80%"}}
                        label={inputLabel}
                        value={(body[keyInput] === ''||body[keyInput] === null) ? null : new Date(body[keyInput])}
                        onChange={(e:any | null)  =>{
                            if(e !== null && !isDateInvalid(e)){
                                setBody(prev => ({...prev,...{[keyInput]:e}}));
                                if(body[keyCompare] !== null && ((formatDateToValidation(e)||0) < (formatDateToValidation(body[keyCompare])||0))){
                                    setError && setError(true);
                                }else if(body[keyCompare] === null && e !== null){
                                    setError && setError(true);
                                }else{
                                    setError && setError(false);
                                }
                            }else{
                                setBody(prev => ({...prev,...{[keyInput]:null}}));
                                setError && setError(false);
                            }
                            clearOnChangeFilter();
                        }}
                        format="dd/MM/yyyy"
                        slotProps={{
                            textField: {
                                error:error,
                            },
                        }}
                    />
                </LocalizationProvider></Grid>);
        case "rag_sociale":
            if(dataSelect && setTextValue && valueAutocomplete && setValueAutocomplete){
                return (
                    <Grid item xs={12} sm={6} md={3}>
                        <MultiselectCheckbox 
                            setBodyGetLista={setBody}
                            dataSelect={dataSelect}
                            setTextValue={setTextValue}
                            valueAutocomplete={valueAutocomplete}
                            setValueAutocomplete={setValueAutocomplete}
                            clearOnChangeFilter={clearOnChangeFilter}
                        ></MultiselectCheckbox>
                    </Grid>
                );
            }else{
                return;
            }
        default:
            return (
                <h1>ciao</h1>
            );
    }
};

export default MainFilter;