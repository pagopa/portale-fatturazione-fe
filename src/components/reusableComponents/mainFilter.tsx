import { Autocomplete, Checkbox, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { Dispatch, SetStateAction } from "react";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { it } from "date-fns/locale";
import { formatDateToValidation, isDateInvalid } from "../../reusableFunction/function";
import { MultiSelect } from "./select/customMultiSelect";
import { mesiGrid } from "../../reusableFunction/reusableArrayObj";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';


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
    keyBody:string;

    extraCodeOnChange?:(e:string) => void,
    extraCodeOnChangeArray?:(e:T[]) => void,


    groupByKey?:string
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
    extraCodeOnChangeArray,
    defaultValue="",
    groupByKey="" //valore inserito quando si ha una chiave uguale a null
}: MainFilterProps<T>) => {


    const getId = (opt: T): string | number => {
        if (typeof opt === "string" || typeof opt === "number") return opt;
        return (opt as any)[keyValue];
    };

    // Returns label for both object or string
    const getLabel = (opt: T): string => {
        if (typeof opt === "string" || typeof opt === "number") return String(opt);
        return (opt as any)[keyDescription];
    };

    // Group by if needed
    const getGroup = (opt: T): string | undefined => {
        if (!groupByKey) return undefined;

        if (typeof opt === "string" || typeof opt === "number") {
            return undefined; // no grouping for strings
        }
        return (opt as any)[groupByKey];
    };

    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;

    let valueOnBodydifferentFromRealValue = body[keyBody];

    if (inputLabel === "Stato" && keyBody === "cancellata") {
        if (body[keyBody] === false) {
            valueOnBodydifferentFromRealValue = 1;
        } else if (body[keyBody] === true) {
            valueOnBodydifferentFromRealValue = 2;
        }
    }

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
                        value={(valueOnBodydifferentFromRealValue||"")||defaultValue}
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
                        value={body[keyBody]||defaultValue}
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
            return ( !hidden &&  keyBody && 
            <MainBoxContainer>
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
                        value={body[keyDescription]||defaultValue}
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
        case "input_text": 
            return (!hidden && 
            <MainBoxContainer> 
                <TextField
                    sx={{width:"80%"}}
                    label={inputLabel}
                    placeholder={inputLabel}
                    value={body[keyDescription] || ''}
                    onChange={(e) =>{
                        clearOnChangeFilter();
                        if(extraCodeOnChange){
                            extraCodeOnChange(e.target.value);
                        }else{
                            setBody((prev)=>{             
                                if(e.target.value === ''){
                                    return {...prev, ...{[keyDescription]:null}};
                                }else{
                                    return {...prev, ...{[keyDescription]:e.target.value}};
                                }
                            });}
                    }
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
                        <Autocomplete
                            style={{ width: '80%'}}
                            multiple
                            limitTags={1}
                            disableCloseOnSelect
                            options={dataSelect}
                            value={valueAutocomplete}
                            groupBy={(opt) => getGroup(opt) ?? ""}
                            getOptionLabel={(opt) => getLabel(opt)}
                            isOptionEqualToValue={(o, v) => getId(o) === getId(v)}
                            onChange={(e, val) =>{
                                clearOnChangeFilter();
                                if(extraCodeOnChangeArray){
                                    extraCodeOnChangeArray(val);
                                }else{
                                    setValueAutocomplete && setValueAutocomplete(val);
                                    const allId = val.map(el => el[keyValue]);
                                    setBody((prev) => ({...prev,...{[keyBody]:allId}}));
                                }
                            }}
                            onInputChange={(e, val) => setTextValue && setTextValue(val)}
                            renderOption={(props, option, { selected }) => (
                                <li {...props} key={getId(option)}>
                                    <Checkbox
                                        icon={icon}
                                        checkedIcon={checkedIcon}
                                        sx={{ mr: 1 }}
                                        checked={selected}
                                    />
                                    {getLabel(option)}
                                </li>
                            )}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label={inputLabel}
                                    placeholder={inputLabel}
                                    value={textValue||""}
                                />
                            )}
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