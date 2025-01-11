import {  Autocomplete, Checkbox, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import { Box, Button} from '@mui/material';
import { useContext, useEffect, useState } from "react";
import { saveAs } from "file-saver";
import DownloadIcon from '@mui/icons-material/Download';
import ModalLoading from "../../components/reusableComponents/modals/modalLoading";
import { manageError } from "../../api/api";
import { AutocompleteMultiselect, OptionMultiselectCheckboxQarter, OptionMultiselectCheckboxPsp, } from "../../types/typeAngraficaPsp";
import { getListaNamePsp } from "../../api/apiPagoPa/anagraficaPspPA/api";
import { deleteFilterToLocalStorageDocConPA, getFilterPageRowDocConPA, getInfoPageFromLocalStorageDocConPA, setFilterPageRowDocConPA, setFilterToLocalStorageDocConPA } from "../../reusableFunction/actionLocalStorage";
import MultiselectWithKeyValue from "../../components/anagraficaPsp/multiselectKeyValue";
import { DocContabili, RequestBodyListaDocContabiliPagopa } from "../../types/typeDocumentiContabili";
import { downloadDocContabili, downloadFinancialReportDocContabili, getListaDocumentiContabiliPa, getQuartersDocContabiliPa, getYearsDocContabiliPa } from "../../api/apiPagoPa/documentiContabiliPA/api";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CollapsibleTablePa from "../../components/reusableComponents/grid/gridCollapsible/gridCustomCollapsiblePa";
import { HeaderCollapsible } from "../../types/typeFatturazione";
import { GlobalContext } from "../../store/context/globalContext";
import RowBase from "../../components/reusableComponents/grid/gridCollapsible/rowBase";




const DocumentiContabili:React.FC = () =>{

    const localStorageFilters = getInfoPageFromLocalStorageDocConPA();
    const localStorageFilterPageRow = getFilterPageRowDocConPA();
    const globalContextObj = useContext(GlobalContext);
    const {dispatchMainState,mainState} = globalContextObj;
 
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;

    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;

    
    const [gridData, setGridData] = useState<DocContabili[]>([]);
    const [statusAnnulla, setStatusAnnulla] = useState('hidden');
    const [filtersDownload, setFiltersDownload] = useState<RequestBodyListaDocContabiliPagopa>({
        contractIds:[],
        membershipId: '',
        recipientId: '',
        abi: '',
        quarters:[],
        year:''
    });

    const [bodyGetLista, setBodyGetLista] = useState<RequestBodyListaDocContabiliPagopa>({
        contractIds:[],
        membershipId: '',
        recipientId: '',
        abi: '',
        quarters:[],
        year:''
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

    const [count, setCount] = useState(0);
    const [dataPaginated,setDataPaginated] = useState<DocContabili[]>([]);

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
        if(bodyGetLista.contractIds.length  !== 0 || bodyGetLista.membershipId !== '' || bodyGetLista.recipientId !== ''|| bodyGetLista.abi !== '' || bodyGetLista.quarters.length > 0){
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
      
        if(bodyGetLista.year !== '' && localStorageFilters?.body?.year !== bodyGetLista.year){
            
            setValueQuarters([]);
            setBodyGetLista((prev)=>({...prev,...{quarters:[]}}));
        }
        getQuarters();
        
    },[bodyGetLista.year]);





    const getListaDocGrid = async(body:RequestBodyListaDocContabiliPagopa) =>{
        setGetListaLoading(true);
        await getListaDocumentiContabiliPa(token, profilo.nonce, body)
            .then((res)=>{
                const dataWithNewId = res.data.financialReports.map(el => {
                    el.id = el.id.toString()+el.yearQuarter;
                    return el;
                });
                setGridData(dataWithNewId);
                setCount(dataWithNewId.length);
                setGetListaLoading(false);
                
            })
            .catch(((err)=>{
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
            })
            .catch(((err)=>{
                manageError(err,dispatchMainState); 
            }));
    };

    const getYears = async () =>{
       
        await getYearsDocContabiliPa(token, profilo.nonce)
            .then((res)=>{
                setYearOnSelect(res.data);
                if(res.data.length > 0){

                    if(Object.keys(localStorageFilterPageRow).length > 0){
                        setPage(localStorageFilterPageRow.page);
                        setRowsPerPage(localStorageFilterPageRow.rowsPerPage);
                    }
                   
                    if(Object.keys(localStorageFilters).length > 0){
                        setBodyGetLista(localStorageFilters.body);
                        setFiltersDownload(localStorageFilters.body);
                        setValueAutocomplete(localStorageFilters.valueAutocomplete);
                        setTextValue(localStorageFilters.textValue);
                        getListaDocGrid(localStorageFilters.body);
                        setValueQuarters(localStorageFilters.valueQuarters);
                    }else{
                        setBodyGetLista((prev) => ({...prev,...{year:res.data[0]}}));
                        setFiltersDownload((prev) => ({...prev,...{year:res.data[0]}}));
                        getListaDocGrid({...bodyGetLista,...{year:res.data[0]}});
                    }
                }
            }).catch(((err)=>{
                manageError(err,dispatchMainState); 
            }));
    };

    const getQuarters = async () =>{
       
        await getQuartersDocContabiliPa(token, profilo.nonce,{year:bodyGetLista.year})
            .then((res)=>{
                setDataSelectQuarter(res.data);
            }).catch(((err)=>{
                manageError(err,dispatchMainState); 
            }));
    };

    
    
    const onDownloadButton = async() =>{
        setShowLoading(true);
        
        await downloadDocContabili(token,profilo.nonce, filtersDownload).then(response =>{
            if(response.status !== 200){
                setShowLoading(false);
                manageError({response:{request:{status:Number(response.status)}},message:''},dispatchMainState);
            }else{
                return response.blob();
            }
        }).then((res) => {
            let fileName = '';
            const stringQuarterSelected = filtersDownload.quarters.map(el => "Q" + el.slice(5)).join("_");
            if(filtersDownload.contractIds.length === 1){
                fileName = `Documenti contabili/${gridData[0].name}/${gridData[0].riferimentoData.substring(0, 4)}/${stringQuarterSelected}.xlsx`;
            }else{
                fileName = `Documenti contabili/${gridData[0].riferimentoData.substring(0, 4)}/${stringQuarterSelected}.xlsx`;
            }
            saveAs( res,fileName );
            setShowLoading(false);
        }).catch(err => {
            setShowLoading(false);
            manageError(err,dispatchMainState);
        });
    };

    const onDownloadReportButton =  async() =>{
        setShowLoading(true);
        await downloadFinancialReportDocContabili(token,profilo.nonce, filtersDownload).then((response) =>{
            if(response.status !== 200){
                setShowLoading(false);
                manageError({response:{request:{status:Number(response.status)}},message:''},dispatchMainState);
            }else{
                return response.blob();
            }
        }).then((res) => {
            let fileName = '';
            const stringQuarterSelected = filtersDownload.quarters.map(el => "Q" + el.slice(5)).join("_");
            if(filtersDownload.contractIds.length === 1){
                fileName = `Financial report PF/${gridData[0].name}/${gridData[0].riferimentoData.substring(0, 4)}/${stringQuarterSelected}.xlsx`;
            }else{
                fileName = `Financial report PF/${gridData[0].riferimentoData.substring(0, 4)}/${stringQuarterSelected}.xlsx`;
            }
            saveAs( res,fileName );
            setShowLoading(false);
        }).catch(err => {
            manageError(err,dispatchMainState);
        });
    };

    const onButtonFiltra = () =>{
        setFiltersDownload(bodyGetLista);
        getListaDocGrid(bodyGetLista); 
        setPage(0);
        setRowsPerPage(10);
        setFilterPageRowDocConPA(0,10);
        setFilterToLocalStorageDocConPA(bodyGetLista,textValue,valueAutocomplete,valueQuarters);
        //handleModifyMainState({filterDocContabili:{body:bodyGetLista,valueAutocomplete:valueAutocomplete, valueQuarters:valueQuarters, infoPage:{page:0,row:10}}});
        //setFilterToLocalStorageRel(bodyRel,textValue,valueAutocomplete, 0, 10,valuetipologiaFattura);
    };
   
                
    

    const headersObjGrid : HeaderCollapsible[] = [
        {name:"",align:"left",id:1},
        {name:"Nome PSP",align:"left",id:2},
        {name:"ID Contratto",align:"center",id:3},
        {name:"Numero",align:"center",id:5},
        {name:"Trimestre",align:"center",id:4},
        {name:"Data",align:"center",id:6},
        {name:"Arrow",align:"center",id:7},
        {name:"Arrow",align:"center",id:8}];
      
 

    return(
        <div className="mx-5">
            {/*title container start */}
            <div className="marginTop24 ">
                <Typography variant="h4">Documenti contabili</Typography>
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
                                onChange={(e) => setBodyGetLista((prev) => ({...prev,...{year:e.target.value}}))}
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
                        limitTags={2}
                        onChange={(event, value) => {
                            const arrayId = value.map(el => el.value);
                            setBodyGetLista((prev) => ({...prev,...{quarters:arrayId}}));
                            setValueQuarters(value);
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
                            onChange={(e) =>  setBodyGetLista((prev)=> ({...prev, ...{membershipId:e.target.value}}))}            
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
                            onChange={(e) =>  setBodyGetLista((prev)=> ({...prev, ...{recipientId:e.target.value}}))}            
                        />
                    </Box>
                </div>
                <div className="col-3">
                    <Box sx={{width:'80%'}} >
                        <TextField
                            fullWidth
                            label='Codice ABI'
                            placeholder='Codice ABI'
                            value={bodyGetLista.abi}
                            onChange={(e) =>  setBodyGetLista((prev)=> ({...prev, ...{abi:e.target.value}}))}            
                        />
                    </Box>
                </div>
            </div>
            <div className="d-flex" >
              
                <div className=" d-flex justify-content-center align-items-center">
                    <div>
                        <Button 
                            onClick={()=> {
                                /* getListaDatifatturazione(bodyGetLista);
                                setInfoPageListaDatiFat({ page: 0, pageSize: 100 });
                                setFiltersDownload(bodyGetLista);
                                setFilterToLocalStorage(bodyGetLista,textValue,valueAutocomplete);
                                setInfoPageToLocalStorage({ page: 0, pageSize: 100 }); */
                                //getListaAnagraficaPspGrid(bodyGetLista,page,rowsPerPage);
                                onButtonFiltra();
                            } } 
                            sx={{ marginTop: 'auto', marginBottom: 'auto'}}
                            variant="contained"> Filtra
                        </Button>
                        {statusAnnulla === 'hidden'? null :
                            <Button
                                onClick={()=>{
                                    const newBody = {
                                        contractIds:[],
                                        membershipId: '',
                                        recipientId: '',
                                        abi: '',
                                        quarters:[],
                                        year:yearOnSelect[0]};
                                    getListaDocGrid(newBody);
                                    setBodyGetLista(newBody);
                                    setFiltersDownload(newBody);
                                    setDataSelect([]);
                                    setValueAutocomplete([]);
                                    setValueQuarters([]);
                                    setPage(0);
                                    setRowsPerPage(10);
                                    deleteFilterToLocalStorageDocConPA();
                                    /*setBodyGetLista({idEnti:[],prodotto:'',profilo:''});
                                    setInfoPageListaDatiFat({ page: 0, pageSize: 100 });
                                    setInfoPageToLocalStorage({ page: 0, pageSize: 100 });
                                    getListaDatifatturazione({idEnti:[],prodotto:'',profilo:''});
                                    setFiltersDownload({idEnti:[],prodotto:'',profilo:''});
                                    setDataSelect([]);
                                    setValueAutocomplete([]);
                                    deleteFilterToLocalStorage();*/
                                } }
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
                    <>
                        <Button sx={{marginRight:'10px',width:'300px'}} onClick={() => onDownloadReportButton()}
                        >
                Download Financial Report
                            <DownloadIcon sx={{marginLeft:'10px'}}></DownloadIcon>
                        </Button>
                        <Button onClick={() =>
                            onDownloadButton()
                        }
                        disabled={getListaLoading}
                        >
                Download Risultati
                            <DownloadIcon sx={{marginRight:'10px'}}></DownloadIcon>
                        </Button>
                    </>
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
                    RowComponent={RowBase}
                ></CollapsibleTablePa>
            </div>
            <div>
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
        </div>
    );
}; 
export default DocumentiContabili;

