import { Autocomplete, Checkbox, Chip, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Tooltip, Typography } from "@mui/material";
import { Dispatch, SetStateAction } from "react";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { it } from "date-fns/locale";
import { formatDateToValidation, isDateInvalid } from "../../reusableFunction/function";
import { MultiSelect } from "./select/customMultiSelect";
import { mesiGrid } from "../../reusableFunction/reusableArrayObj";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import Paper from "@mui/material/Paper";
import GavelIcon from '@mui/icons-material/Gavel';


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
    fontSize?:string|null,

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


    groupByKey?:string,
    iconMaterial?:React.ReactNode
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
    groupByKey="", //valore inserito quando si ha una chiave uguale a null
    fontSize,
    iconMaterial
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
                <FormControl fullWidth>
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
                        value={(valueOnBodydifferentFromRealValue)||defaultValue}
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
                <FormControl fullWidth >
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


            console.log(arrayValues,body,keyDescription);
            return ( !hidden &&  keyBody && arrayValues &&
            <MainBoxContainer>
                <FormControl fullWidth >
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
                        value={arrayValues[body[keyDescription]]||defaultValue}
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
        case "select_value_string":
            console.log(arrayValues,body,keyDescription);
            return ( !hidden &&  keyBody && arrayValues &&
            <MainBoxContainer>
                <FormControl  fullWidth >
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
            
            return ( !hidden && keyCompare && <MainBoxContainer> 
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={it}>
                    <DesktopDatePicker
                        label={inputLabel}
                        value={(body[keyValue] === ''||body[keyValue] === null) ? null : new Date(body[keyValue])}
                        onChange={(e:any | null)  =>{
                            if(e !== null && !isDateInvalid(e)){
                                console.log({keyDescription,keyValue},"ZORRO",body[keyValue],{format:formatDateToValidation(e)});
                                console.log(6,{e});
                                setBody(prev => ({...prev,...{[keyValue]:e}}));
                                if(keyDescription === "start" && keyCompare && body[keyCompare] !== null && ((formatDateToValidation(e)||0) > (formatDateToValidation(body[keyCompare])||0))){
                                    setError && setError(true);
                                    console.log(1,{e});
                                }else if(keyDescription === "end" && keyCompare && body[keyCompare] !== null && ((formatDateToValidation(e)||0) < (formatDateToValidation(body[keyCompare])||0))){
                                    setError && setError(true);
                                    console.log(2,{e});
                                }else if( body[keyCompare] === null && e !== null){
                                    setError && setError(true);
                                    console.log(3,{e});
                                }else if(keyCompare){
                                    setError && setError(false);
                                    console.log(4,{e});
                                }
                            }else{
                                setBody(prev => ({...prev,...{[keyValue]:null}}));
                                if((body[keyCompare] !== null  && (e === null || e instanceof Date && isNaN(e.getTime())))){
                                    setError && setError(true);
                                    console.log(8);
                                }else{
                                    setError && setError(false);
                                    console.log(7,{e},e === "Invalid Date",isNaN(e.getTime()));
                                }
                               
                            }
                            clearOnChangeFilter();
                        }}
                        format="dd/MM/yyyy"
                        slotProps={{
                            textField: {
                                error:error,
                                fullWidth: true,
                            },
                        }}
                    />
                </LocalizationProvider></MainBoxContainer>);
        case "multi_checkbox":
            if(!hidden && dataSelect && valueAutocomplete && keyBody && keyDescription && keyValue ){
                return (
                    <MainBoxContainer>
                        <Autocomplete
                            fullWidth
                            sx={{
                             
                                height:"59px",
                                "& .MuiAutocomplete-inputRoot.Mui-focused": {
                                    zIndex: 2,
                                    backgroundColor: "#F3F4F6",
                                    
                                    
                                },
                                "& .MuiInputLabel-root.Mui-focused": {
                                    zIndex: 3,     
                                    position: "absolute",
                                    height:"59px",
                                },
                              
                            }}
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
                            renderTags={(value, getTagProps) =>
                                value.map((option, index) => {
                                    const props = getTagProps({ index });

                                    return (
                                        <Tooltip
                                            title={getLabel(option)}
                                            key={getId(option)}
                                            placement="top"
                                        >
                                            <Chip
                                                {...props}
                                                label={
                                                    iconMaterial ? iconMaterial :<AccountBalanceIcon
                                                        fontSize="small"
                                                    />
                                                }
                                            />
                                        </Tooltip>
                                    );
                                })
                            }
                            renderOption={(props, option, { selected }) => (
                                <li {...props} key={getId(option)}>
                                    <Checkbox
                                        icon={icon}
                                        checkedIcon={checkedIcon}
                                        sx={{ mr: 1 }}
                                        checked={selected}
                                    />
                                    <Typography sx={{ fontSize: fontSize ? "0.875rem":undefined}}>{getLabel(option)}</Typography>
                                    
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
        <Grid item xs={12} sm={6} md={4} lg={2.3}
            sx={{
                display: "flex",
                justifyContent: { xs: "center", sm: "center",md: "flex-start" },
                marginTop:"1rem"
            }}>
            {children}
        </Grid>
    );
};