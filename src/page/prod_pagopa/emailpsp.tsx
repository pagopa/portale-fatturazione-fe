import { Autocomplete, Box, Button, Checkbox, FormControl, InputLabel, MenuItem, Select, TextField, Tooltip, Typography } from "@mui/material";
import { AutocompleteMultiselect, OptionMultiselectCheckboxPsp, OptionMultiselectCheckboxQarter } from "../../types/typeAngraficaPsp";
import MultiselectWithKeyValue from "../../components/anagraficaPsp/multiselectKeyValue";
import useSavedFilters from "../../hooks/useSaveFiltersLocalStorage";
import { PathPf } from "../../types/enum";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import DataObjectIcon from '@mui/icons-material/DataObject';
import EmailIcon from '@mui/icons-material/Email';
import { useEffect, useState } from "react";
import { getQuartersDocContabiliPa, getYearsDocContabiliPa } from "../../api/apiPagoPa/documentiContabiliPA/api";
import { manageError } from "../../api/api";
import { getListaNamePsp } from "../../api/apiPagoPa/anagraficaPspPA/api";
import { useGlobalStore } from "../../store/context/useGlobalStore";

export interface RequestBodyMailPsp{
    contractIds: string[],
    quarters: string[],
    year: string
}

const EmailPsp = () => {

    const mainState = useGlobalStore(state => state.mainState);
    const dispatchMainState = useGlobalStore(state => state.dispatchMainState);
   
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;

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
    const [filtersDownload, setFiltersDownload] = useState<RequestBodyMailPsp>({
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

    useEffect(()=>{
        getYears();
    }, []);

    const getYears = async () =>{
        await getYearsDocContabiliPa(token, profilo.nonce)
            .then((res)=>{
                setYearOnSelect(res.data);
                if(res.data.length > 0){
                    if(isInitialRender.current && Object.keys(filters).length > 0){
                        setBodyGetLista(filters.body);
                        setFiltersDownload(filters.body);
                        setValueAutocomplete(filters.valueAutocomplete);
                        setTextValue(filters.textValue);
                        // getListaKpiGrid(filters.body);
                        setValueQuarters(filters.valueQuarters);
                        //setPage(filters.page);
                        //setRowsPerPage(filters.rows);
                        getQuarters(filters.body.year);
    
                            
                    }else{
                        setBodyGetLista((prev) => ({...prev,...{year:res.data[0]}}));
                        setFiltersDownload((prev) => ({...prev,...{year:res.data[0]}}));
                        //getListaKpiGrid({...bodyGetLista,...{year:res.data[0]}});
                        getQuarters(res.data[0]);
                          
                    }
                }
            }).catch(((err)=>{
                manageError(err,dispatchMainState); 
            }));
    };

    const getQuarters = async (y) =>{
        await getQuartersDocContabiliPa(token, profilo.nonce,{year:y})
            .then((res)=>{
                setDataSelectQuarter(res.data);
                isInitialRender.current = false;
            }).catch(((err)=>{
                isInitialRender.current = false;
                setValueQuarters([]);
                setDataSelectQuarter([]);
                manageError(err,dispatchMainState); 
            }));
    };

    const listaNamePspOnSelect = async () =>{
        await getListaNamePsp(token, profilo.nonce, {name:textValue} )
            .then((res)=>{
                setDataSelect(res.data);
            }).catch(((err)=>{
                manageError(err,dispatchMainState); 
            }));
    };

    useEffect(()=>{
        const timer = setTimeout(() => {
            if(textValue.length >= 3){ 
                listaNamePspOnSelect();
            }
        }, 800);
        return () => clearTimeout(timer);
    },[textValue]);

    
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
            <div className="row mt-5">
                <div  className="col-6 mt-5">
                    <div className="d-flex">
                        <Button 
                            sx={{ marginTop: 'auto', marginBottom: 'auto'}} variant="contained"> 
                                            Filtra
                        </Button>
                    
                        <Button sx={{marginLeft:'24px'}} >
                               Annulla filtri
                        </Button>
                        
                    </div>
                </div>
                <div className="col-6 mt-5">
                    <div className="d-flex flex-row-reverse">
                        <Tooltip  className="mx-2" title="Invia Json PSP">
                            <span>
                                <Button variant="outlined"><DataObjectIcon></DataObjectIcon></Button>
                            </span>
                        </Tooltip>
                        <Tooltip  className="mx-2" title="Invia financial report PSP">
                            <span>
                                <Button variant="outlined">  <EmailIcon></EmailIcon></Button>
                            </span>
                        </Tooltip>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailPsp;