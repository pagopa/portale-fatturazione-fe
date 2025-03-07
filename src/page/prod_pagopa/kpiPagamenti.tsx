import {  Autocomplete, Checkbox, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import { Box, Button} from '@mui/material';
import { useContext, useEffect, useState } from "react";
import DownloadIcon from '@mui/icons-material/Download';
import ModalLoading from "../../components/reusableComponents/modals/modalLoading";
import { manageError, manageErrorDownload } from "../../api/api";
import { AutocompleteMultiselect, OptionMultiselectCheckboxQarter, OptionMultiselectCheckboxPsp, } from "../../types/typeAngraficaPsp";
import { getListaNamePsp } from "../../api/apiPagoPa/anagraficaPspPA/api";
import MultiselectWithKeyValue from "../../components/anagraficaPsp/multiselectKeyValue";
import {getQuartersDocContabiliPa, getYearsDocContabiliPa } from "../../api/apiPagoPa/documentiContabiliPA/api";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CollapsibleTablePa from "../../components/reusableComponents/grid/gridCollapsible/gridCustomCollapsiblePa";
import { HeaderCollapsible } from "../../types/typeFatturazione";
import { GlobalContext } from "../../store/context/globalContext";
import ModalMatriceKpi from "../../components/kpi/modalMatriceKpi";
import { kpiObj, RequestBodyKpi } from "../../types/typeKpi";
import { downloadKpiList, getListaKpi } from "../../api/apiPagoPa/kpi/api";
import RowBaseKpi from "../../components/reusableComponents/grid/gridCollapsible/rowBaseKpi";
import { saveAs } from "file-saver";
import { PathPf } from "../../types/enum";
import useSavedFilters from "../../hooks/useSaveFiltersLocalStorage";

const KpiPagamenti:React.FC = () =>{

    const globalContextObj = useContext(GlobalContext);
    const {dispatchMainState,mainState} = globalContextObj;
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;
    const { 
        filters,
        updateFilters,
        resetFilters,
        isInitialRender
    } = useSavedFilters(PathPf.KPI,{});

    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;

    
    const [gridData, setGridData] = useState<kpiObj[]>([]);
    const [statusAnnulla, setStatusAnnulla] = useState('hidden');
    const [filtersDownload, setFiltersDownload] = useState<RequestBodyKpi>({
        contractIds: [],
        membershipId: '',
        recipientId: '',
        providerName: '',
        quarters: [],
        year: ''
    });

    const [bodyGetLista, setBodyGetLista] = useState<RequestBodyKpi>({
        contractIds: [],
        membershipId: '',
        recipientId: '',
        providerName: '',
        quarters: [],
        year: ''
    });
   
    const [getListaLoading, setGetListaLoading] = useState(false);
    const [dataSelect, setDataSelect] = useState<OptionMultiselectCheckboxPsp[]>([]);
    const [dataSelectQuarter, setDataSelectQuarter] = useState<OptionMultiselectCheckboxQarter[]>([]);
    const [valueQuarters, setValueQuarters] = useState<OptionMultiselectCheckboxQarter[]>([]);
    const [textValue, setTextValue] = useState<string>('');
    const [valueAutocomplete, setValueAutocomplete] = useState<AutocompleteMultiselect[]>([]);
    const [showLoading,setShowLoading] = useState(false);
    const [yearOnSelect,setYearOnSelect] = useState<string[]>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [showPopUpMatrice,setShowPopUpMatrice] = useState(false);
    const [count, setCount] = useState(0);
    const [dataPaginated,setDataPaginated] = useState<kpiObj[]>([]);

    useEffect(()=>{
        getYears();
    }, []);


    useEffect(()=>{
        let from = 0;
        if(page === 0){
            from = 0;
        }else{
            from = page * rowsPerPage;
        }
        setDataPaginated(gridData.slice(from, rowsPerPage + from));
    }, [page,rowsPerPage,gridData]);


    useEffect(()=>{
        if(bodyGetLista.contractIds.length  !== 0 || bodyGetLista.membershipId !== '' || bodyGetLista.recipientId !== ''|| bodyGetLista.providerName !== '' || bodyGetLista.quarters.length > 0){
            setStatusAnnulla('show');
        }else{
            setStatusAnnulla('hidden');
        }

    },[bodyGetLista]);

    useEffect(()=>{
        const timer = setTimeout(() => {
            if(textValue.length >= 3){ 
                listaNamePspOnSelect();
            }
        }, 800);
        return () => clearTimeout(timer);
    },[textValue]);

    useEffect(()=>{
        if(bodyGetLista.year !== '' && !isInitialRender.current){
            setValueQuarters([]);
            setBodyGetLista((prev)=>({...prev,...{quarters:[]}}));
            getQuarters(bodyGetLista.year);
        }
    },[bodyGetLista.year]);

    const getListaKpiGrid = async(body:RequestBodyKpi) =>{
        setGetListaLoading(true);
        await getListaKpi(token, profilo.nonce, body)
            .then((res)=>{
                const data = res.data.kpiPagamentiScontoReports;
                setGridData(data);
                setCount(res.data.count);
                setGetListaLoading(false);
            }).catch(((err)=>{
                setGridData([]);
                setCount(0);
                setGetListaLoading(false);
                manageError(err,dispatchMainState);
            })); 
    };

    // servizio che popola la select con la checkbox
    const listaNamePspOnSelect = async () =>{
        await getListaNamePsp(token, profilo.nonce, {name:textValue} )
            .then((res)=>{
                setDataSelect(res.data);
            }).catch(((err)=>{
                manageError(err,dispatchMainState); 
            }));
    };

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
                        getListaKpiGrid(filters.body);
                        setValueQuarters(filters.valueQuarters);
                        setPage(filters.page);
                        setRowsPerPage(filters.rows);
                        getQuarters(filters.body.year);

                        
                    }else{
                        setBodyGetLista((prev) => ({...prev,...{year:res.data[0]}}));
                        setFiltersDownload((prev) => ({...prev,...{year:res.data[0]}}));
                        getListaKpiGrid({...bodyGetLista,...{year:res.data[0]}});
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

    const onDownloadButton = async() =>{
        setShowLoading(true);
        await downloadKpiList(token,profilo.nonce, filtersDownload).then(response =>{
            if (response.ok) {
                return response.blob();
            }
            throw '404';
        }).then((res) => {
            let fileName = '';
            const stringQuarterSelected = filtersDownload.quarters.map(el => "Q" + el.slice(5)).join("_");
            if(filtersDownload.contractIds.length === 1){
                fileName = `Lista pagamenti KPI/${gridData[0].name}/${filtersDownload.year}/${stringQuarterSelected}.xlsx`;
            }else{
                fileName = `Lista pagamenti KPI/${filtersDownload.year}/${stringQuarterSelected}.xlsx`;
            }
            saveAs( res,fileName );
            setShowLoading(false);
        }).catch(err => {
            setShowLoading(false);
            manageErrorDownload(err,dispatchMainState);
        });
    };

    const clearOnChangeFilter = () => {
        setGridData([]);
        setPage(0);
        setRowsPerPage(10);
        setCount(0);
    };

    const onButtonFiltra = () =>{
        updateFilters(
            {
                body:bodyGetLista,
                pathPage:PathPf.KPI,
                textValue,
                valueAutocomplete,
                valueQuarters,
                page:0,
                rows:10
            });
        setFiltersDownload(bodyGetLista);
        getListaKpiGrid(bodyGetLista); 
        setPage(0);
        setRowsPerPage(10);
    };

    const onButtonAnnulla = () => {            
        const newBody = {
            contractIds:[],
            membershipId: '',
            recipientId: '',
            providerName: '',
            quarters:[],
            year:yearOnSelect[0]};
        getListaKpiGrid(newBody);
        setBodyGetLista(newBody);
        setFiltersDownload(newBody);
        setDataSelect([]);
        setValueAutocomplete([]);
        setValueQuarters([]);
        setPage(0);
        setRowsPerPage(10);
        resetFilters();
    };

    const onUpdateFiltersGrid = (page, rows) => {
        updateFilters({
            page:page,
            rows:rows,
            pathPage:PathPf.KPI,
            body:bodyGetLista,
            textValue:textValue,
            valueAutocomplete:valueAutocomplete,
            valueQuarters:valueQuarters,
        });
    };
   
    const headersObjGrid : HeaderCollapsible[] = [
        {name:"",align:"left",id:1},
        {name:"Nome KPI",align:"left",id:2},
        {name:"Trimestre",align:"center",id:3},
        {name:"Recipient ID",align:"center",id:5},
        {name:"Totale",align:"center",id:4},
        {name:"Totale sconto",align:"center",id:6},
        {name:"Lista KPI",align:"center",id:7},
        {name:"Arrow",align:"center",id:8}];
      
    return(
        <div className="mx-5">
            {/*title container start */}
            <div className="d-flex marginTop24 ">
                <div className="col-9">
                    <Typography variant="h4">KPI Pagamenti</Typography>
                </div>
                <div className="col-3 ">
                    <Box sx={{width:'80%', marginLeft:'20px', display:'flex', justifyContent:'end'}}  >
                        <Button  style={{
                            width:'160px'
                        }} variant="outlined"  onClick={()=> setShowPopUpMatrice(true)} >
                    Matrice KPI
                        </Button>
                    </Box>
                </div>
            </div>
            {/*title container end */}
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
            <div className="row mb-5 mt-5" >
                <div className="col-3">
                    <Box sx={{width:'80%'}} >
                        <TextField
                            fullWidth
                            label='Membership ID'
                            placeholder='Membership ID'
                            value={bodyGetLista.membershipId}
                            onChange={(e) =>{
                                clearOnChangeFilter();
                                setBodyGetLista((prev)=> ({...prev, ...{membershipId:e.target.value}})); 
                            }}            
                        />
                    </Box>
                </div>
                <div className="col-3">
                    <Box sx={{width:'80%'}} >
                        <TextField
                            fullWidth
                            label='Recipient ID'
                            placeholder='Recipient ID'
                            value={bodyGetLista.recipientId}
                            onChange={(e) =>{
                                clearOnChangeFilter();
                                setBodyGetLista((prev)=> ({...prev, ...{recipientId:e.target.value}}));
                            }}            
                        />
                    </Box>
                </div>
                <div className="col-3">
                    <Box sx={{width:'80%'}} >
                        <TextField
                            fullWidth
                            label='Provider name/ID'
                            placeholder='Provider name/ID'
                            value={bodyGetLista.providerName}
                            onChange={(e) =>{
                                clearOnChangeFilter();
                                setBodyGetLista((prev)=> ({...prev, ...{providerName:e.target.value}}));
                            }}            
                        />
                    </Box>
                </div>
            </div>
            <div className="d-flex" >
                <div className=" d-flex justify-content-center align-items-center">
                    <div>
                        <Button 
                            onClick={onButtonFiltra} 
                            disabled={getListaLoading}
                            sx={{ marginTop: 'auto', marginBottom: 'auto'}}
                            variant="contained"> Filtra
                        </Button>
                        { statusAnnulla === 'hidden'? null :
                            <Button
                                onClick={onButtonAnnulla}
                                sx={{marginLeft:'24px'}} >
                        Annulla filtri
                            </Button>}  
                    </div>
                </div>
            </div>
            {/* grid */}
            <div className="marginTop24" style={{display:'flex', justifyContent:'end'}}>
                {
                    gridData.length > 0 &&
                        <Button onClick={onDownloadButton}
                            disabled={gridData.length < 1 ||getListaLoading}
                        >
                Download Risultati
                            <DownloadIcon sx={{marginRight:'10px'}}></DownloadIcon>
                        </Button>
                }
            </div>
            <div className="mt-1 mb-5">
                <CollapsibleTablePa 
                    headerNames={headersObjGrid}
                    setPage={setPage}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    setRowsPerPage={setRowsPerPage}
                    count={count}
                    dataPaginated={dataPaginated}
                    RowComponent={RowBaseKpi}
                    updateFilters={onUpdateFiltersGrid}
                    body={filtersDownload}
                ></CollapsibleTablePa>
            </div>
            <ModalLoading 
                open={showLoading} 
                setOpen={setShowLoading}
                sentence={'Downloading...'} >
            </ModalLoading>
            <ModalLoading 
                open={getListaLoading} 
                setOpen={setGetListaLoading}
                sentence={'Loading...'} >
            </ModalLoading>
            <ModalMatriceKpi 
                open={showPopUpMatrice} 
                setOpen={setShowPopUpMatrice}
                anni={yearOnSelect}
                setShowLoading={setShowLoading}
            ></ModalMatriceKpi>
        </div>
    );
}; 
export default KpiPagamenti;

