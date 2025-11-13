import { FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { Dispatch, SetStateAction } from "react";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { it } from "date-fns/locale";
import { formatDateToValidation, isDateInvalid } from "../../reusableFunction/function";

type MainFilterProps =  {
    filterName: string,
    clearOnChangeFilter:() => void,
    setBody:Dispatch<SetStateAction<any>>,
    body:any,
    arrayValues:any[],
    inputLabel:string,
    keyInput:string,
    error:boolean,
    setError:Dispatch<SetStateAction<boolean>>,

}

const MainFilter = ({filterName,inputLabel,clearOnChangeFilter,setBody, body, arrayValues,keyInput,error,setError}:MainFilterProps) => {

    switch (filterName) {
        case "select_key_value":  //case "select_prodotto":case "select_profilo":case "select_anno":case "select_mese":consolidatore recapitista
            return ( <FormControl
                fullWidth
                size="medium"
            >
                <InputLabel>
                    {inputLabel}
                </InputLabel>
                <Select
                    id="sea"
                    label='Seleziona Prodotto'
                    labelId="search-by-label"
                    onChange={(e) =>{
                        clearOnChangeFilter();
                        setBody((prev)=> ({...prev, ...{prodotto:e.target.value}}));
                    }}
                    value={body.prodotto}
                >
                    {arrayValues.map((el) => (
                        <MenuItem
                            key={Math.random()}
                            value={el.nome||''}
                        >
                            {el.nome}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>);
        case "input_text":  //"input_iun":case "input_cup":case "input_recipient_id":
            return (<TextField
                fullWidth
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
            />);
        case "date_from_to": 
            return (<LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={it} >
                <DesktopDatePicker
                    label={"Data inizio"}
                    format="dd/MM/yyyy"
                    value={(body.init === ''||body.init === null) ? null : new Date(body.init)}
                    onChange={(e:any | null)  => {
                        if(e !== null && !isDateInvalid(e)){
                            setBody(prev => ({...prev,...{init:e}}));
                            if(body.end !== null && ((formatDateToValidation(e)||0) > (formatDateToValidation(body.end)||0))){
                                setError(true);
                            }else{
                                setError(false);
                            }
                        }else{
                            setBody(prev => ({...prev,...{init:null}}));
                            if(body.end !== null){
                                setError(true);
                            }else{
                                setError(false);
                            }
                        }
                        clearOnChangeFilter();
                        formatDateToValidation(e);
                    }}
                    slotProps={{
                        textField: {
                            error:error,
                        },
                    }}
                />
            </LocalizationProvider>);
        default:
            return (
                <h1>ciao</h1>
            );
    }
};

export default MainFilter;