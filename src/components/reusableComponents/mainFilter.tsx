import { FormControl, Grid, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { Dispatch, SetStateAction } from "react";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { it } from "date-fns/locale";
import { formatDateToValidation, isDateInvalid } from "../../reusableFunction/function";
import { MultiSelect } from "./select/customMultiSelect";
import { mesiGrid } from "../../reusableFunction/reusableArrayObj";


export type MainFilterProps<T> = {
    filterName: string;
    clearOnChangeFilter: () => void;
    setBody:any
    body: any;
    arrayValues?: any[];
    inputLabel: string;
    keyDescription: string;     // field used as value
    keyValue:number|string;
    defaultValue?:string|number|null // valore da settare se si ha un valore null da inserire nel body

    keyOption?:string;   // field used as label
    keyCompare?: string;  // optional compare field
    error?: boolean;
    setError?: Dispatch<SetStateAction<boolean>>;

    dataSelect?:T[];
    //valuesSelected?: T[];
    //setValuSelected?:Dispatch<SetStateAction<T[]>>

    valueAutocomplete?: T[];
    setValueAutocomplete?: Dispatch<SetStateAction<T[]>>;
    
    setSecondState?: Dispatch<SetStateAction<T[]>>;
    setTextValue?: Dispatch<SetStateAction<string>>;
    textValue?:string;
    hidden?: boolean;
    keyBody?:string;

    extraCodeOnChange?:(e:React.ChangeEvent<HTMLInputElement>) => void
};

const MainFilter = <T,>({
    filterName,
    inputLabel,
    clearOnChangeFilter,
    setBody,
    body,
    arrayValues,
    keyDescription,//descrizione della valore nella select es. descrizione
    keyValue,//valore reale della select tipo index es. id
    keyCompare,
    error,
    setError,
    dataSelect,
    // valuesSelected,
    //setValuSelected,
    hidden,
    keyOption,
    valueAutocomplete,
    setValueAutocomplete,
    setTextValue,
    textValue,
    keyBody,// chiave da inserire nel body
    extraCodeOnChange,
    defaultValue="" //valore inserito quando si ha una chiave uguale a null
}: MainFilterProps<T>) => {

    switch (filterName) {
        case "select_key_value": 
            return ( !hidden && keyBody && <MainBoxContainer>
                <FormControl sx={{width:"80%"}}>
                    <InputLabel>
                        {inputLabel}
                    </InputLabel>
                    <Select
                        label={inputLabel}
                        onChange={(e) =>{
                            clearOnChangeFilter();
                            if(extraCodeOnChange){
                                extraCodeOnChange(e.target.value);
                            }else{
                                setBody((prev)=> ({...prev, ...{[keyBody]:e.target.value}}));
                            }
                        }}
                        value={body[keyBody]||defaultValue}
                    >
                        {arrayValues?.map((el) => (
                            <MenuItem
                                key={Math.random()}
                                value={el[keyValue]||''}
                            >
                                {el[keyDescription]||""}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </MainBoxContainer>);
        case "select_key_value_description":  //case "select_prodotto":case "select_profilo":case "select_anno":case "select_mese":consolidatore recapitista
            return ( !hidden && keyBody && keyOption && <MainBoxContainer>
                <FormControl sx={{width:"80%"}}>
                    <InputLabel>
                        {inputLabel}
                    </InputLabel>
                    <Select
                        label={inputLabel}
                        onChange={(e) =>{
                            clearOnChangeFilter();
                            if(extraCodeOnChange){
                                extraCodeOnChange(e.target.value);
                            }else{
                                setBody((prev)=> ({...prev, ...{[keyBody]:e.target.value}}));
                            }
                        }}
                        value={body[keyBody]||""}
                    >
                        {arrayValues?.map((el) => (
                            <MenuItem
                                key={Math.random()}
                                value={el[keyDescription]||''}
                            >
                                {el[keyOption]||""}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </MainBoxContainer>);
        case "select_value":
            return ( !hidden &&  keyBody && <MainBoxContainer>
                <FormControl sx={{width:"80%"}}>
                    <InputLabel>
                        {inputLabel}
                    </InputLabel>
                    <Select
                        label={inputLabel}
                        onChange={(e) => {
                    
                            clearOnChangeFilter();
                            if(extraCodeOnChange){
                                extraCodeOnChange(e.target.value);
                            }else{
                                setBody((prev)=> ({...prev, ...{[keyBody]:e.target.value}}));
                            }
                            
                        }}
                        value={body[keyDescription]||""}
                    >
                        {arrayValues?.map((el) => (
                            <MenuItem
                                key={Math.random()}
                                value={el||''}
                            >
                                {inputLabel === "Mese" ? mesiGrid[el] : el||""}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
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
                    value={body[keyDescription] || ''}
                    onChange={(e) =>{
                        clearOnChangeFilter();
                        setBody((prev)=>{             
                            if(e.target.value === ''){
                                return {...prev, ...{[keyDescription]:null}};
                            }else{
                                return {...prev, ...{[keyDescription]:e.target.value}};
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
                        value={(body[keyDescription] === ''||body[keyDescription] === null) ? null : new Date(body[keyDescription])}
                        onChange={(e:any | null)  =>{
                            if(e !== null && !isDateInvalid(e)){
                                setBody(prev => ({...prev,...{[keyDescription]:e}}));
                                if(keyCompare && body[keyCompare] !== null && ((formatDateToValidation(e)||0) < (formatDateToValidation(body[keyCompare])||0))){
                                    setError && setError(true);
                                }else if(keyCompare && body[keyCompare] === null && e !== null){
                                    setError && setError(true);
                                }else if(keyCompare){
                                    setError && setError(false);
                                }
                            }else{
                                setBody(prev => ({...prev,...{[keyDescription]:null}}));
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
        case "multi_checkbox":
            if(dataSelect && valueAutocomplete && keyBody && keyDescription && keyValue ){
                return (
                    <MainBoxContainer>
                        <MultiSelect<T>
                            label={inputLabel}
                            options={dataSelect}
                            value={valueAutocomplete}
                            setTextValue={setTextValue}
                            textValue={textValue}
                            onChange={(val) => {
                                clearOnChangeFilter();
                                console.log({val});
                                setValueAutocomplete && setValueAutocomplete(val);
                                const allId = val.map(el => el[keyValue]);
                                setBody((prev) => ({...prev,...{[keyBody]:allId}}));
                            }}
                            getLabel={(item) => (item as any)[keyDescription||0]}
                            getId={(item) => (item as any)[keyValue]}
                        />
                    </MainBoxContainer>
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