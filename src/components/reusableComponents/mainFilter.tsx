import { Autocomplete, Checkbox, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { Dispatch, SetStateAction } from "react";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { it } from "date-fns/locale";
import { formatDateToValidation, isDateInvalid } from "../../reusableFunction/function";
import MultiselectCheckbox from "../reportDettaglio/multiSelectCheckbox";
import MultiSelectStatoContestazione from "../reportDettaglio/multiSelectGroupedBy";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { OptionType } from "dayjs";
import { FlagContestazione, OptionMultiselectChackbox } from "../../types/typeReportDettaglio";
import { BodyListaNotifiche } from "../../types/typesGeneral";
import { BodyFatturazione } from "../../types/typeFatturazione";
import { BodyStoricoContestazioni, TipologieDoc } from "../../page/prod_pn/storicoContestazioni";
import { BodyWhite } from "../../api/apiPagoPa/whiteListPA/whiteList";
import { BodyGetListaDatiFatturazione } from "../../types/typeListaDatiFatturazione";
import { BodyDownloadModuliCommessa } from "../../types/typeListaModuliCommessa";
import { BodyRel } from "../../types/typeRel";
import { BodyContratto } from "../../page/prod_pn/tipologiaContratto";
import { MultiSelect } from "./select/customMultiSelect";

export type MainFilterProps<T> = {
    filterName: string;
    clearOnChangeFilter: () => void;
    setBody:any
    body: any;
    arrayValues?: any[];
    inputLabel: string;
    keyInput: string;     // field used as value
    keyOption?:string;   // field used as label
    keyCompare?: string;  // optional compare field
    error?: boolean;
    setError?: Dispatch<SetStateAction<boolean>>;

    dataSelect?:T[];
    valuesSelected?: T[];
    setValuSelected?:Dispatch<SetStateAction<T[]>>

    valueAutocomplete?:T[],
    setValueAutocomplete?:Dispatch<SetStateAction<T[]>>,
    setSecondState?: Dispatch<SetStateAction<T[]>>;
    setTextValue?: Dispatch<SetStateAction<string>>;
    hidden?: boolean;
};

const MainFilter = <T,>({
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
    setValueAutocomplete,
    setSecondState,
    valuesSelected,
    setValuSelected,
    hidden,
    keyOption = "",
}: MainFilterProps<T>) => {

    switch (filterName) {
        case "select_key_value":  //case "select_prodotto":case "select_profilo":case "select_anno":case "select_mese":consolidatore recapitista
            return ( !hidden && <MainBoxContainer>
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
            </MainBoxContainer>);
        case "select_value":
            return ( !hidden && <MainBoxContainer>
                <FormControl sx={{width:"80%"}}>
                    <InputLabel>
                        {inputLabel}
                    </InputLabel>
                    <Select
                        label=  {inputLabel}
                        onChange={(e) => {
                            clearOnChangeFilter();
                            setBody((prev)=> ({...prev, ...{[keyInput]:e.target.value}}));
                        }}
                        value={body[keyInput]||""}
                    >
                        {arrayValues?.map((el) => (
                            <MenuItem
                                key={Math.random()}
                                value={el||''}
                            >
                                {el}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>;
            </MainBoxContainer>);
        case "select_grouped_by":
            return(
                !hidden && <MainBoxContainer> 
                    <h1>to do</h1>
                </MainBoxContainer>
            );    
        case "input_text": 
            return (!hidden && <MainBoxContainer> 
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
                /> </MainBoxContainer>);
        case "date_from_to": 
            return ( !hidden && <MainBoxContainer> 
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={it}>
                    <DesktopDatePicker
                        sx={{width:"80%"}}
                        label={inputLabel}
                        value={(body[keyInput] === ''||body[keyInput] === null) ? null : new Date(body[keyInput])}
                        onChange={(e:any | null)  =>{
                            if(e !== null && !isDateInvalid(e)){
                                setBody(prev => ({...prev,...{[keyInput]:e}}));
                                if(keyCompare && body[keyCompare] !== null && ((formatDateToValidation(e)||0) < (formatDateToValidation(body[keyCompare])||0))){
                                    setError && setError(true);
                                }else if(keyCompare && body[keyCompare] === null && e !== null){
                                    setError && setError(true);
                                }else if(keyCompare){
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
                </LocalizationProvider></MainBoxContainer>);
        case "rag_sociale":
            if(dataSelect && setTextValue && valueAutocomplete && setValueAutocomplete && !hidden){
                return (
                    <MainBoxContainer>
                        <MultiselectCheckbox 
                            setBodyGetLista={setBody}
                            dataSelect={dataSelect}
                            setTextValue={setTextValue}
                            valueAutocomplete={valueAutocomplete}
                            setValueAutocomplete={setValueAutocomplete}
                            clearOnChangeFilter={clearOnChangeFilter}
                        ></MultiselectCheckbox>
                    </MainBoxContainer>
                );
            }else{
                return;
            }
        case "multi_checkbox":
            if(dataSelect && setValuSelected){
                return (
                    <MainBoxContainer>
                        <MultiSelect<T>
                            label={inputLabel}
                            options={dataSelect}
                            value={valuesSelected}
                            onChange={(val) => {
                                clearOnChangeFilter();
                                setValueAutocomplete?.(val);
                            }}
                            getLabel={(item) => (item as any)[keyOption]}
                            getId={(item) => (item as any)[keyInput]}
                        />
                    </MainBoxContainer>
                );
            }
            
               
        default:
            return (
                <h1>ciao</h1>
            );
    }
};

export default MainFilter;


export const MainBoxContainer = ({children}) => {
    return (
        <Grid item xs={12} sm={6} md={3}
            sx={{
                display: "flex",
                justifyContent: { xs: "center", sm: "center",md: "flex-start" } 
            }}>
            {children}
        </Grid>
    );
};