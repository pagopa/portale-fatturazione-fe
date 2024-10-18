import {  Autocomplete, Checkbox, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import { Box, Button} from '@mui/material';
import { useEffect, useState } from "react";
import { saveAs } from "file-saver";
import DownloadIcon from '@mui/icons-material/Download';
import ModalLoading from "../../components/reusableComponents/modals/modalLoading";
import { manageError } from "../../api/api";
import { AutocompleteMultiselect, GridElementListaPsp, OptionMultiselectCheckboxQarter, OptionMultiselectCheckboxPsp, } from "../../types/typeAngraficaPsp";
import { downloadPsp, getListaNamePsp } from "../../api/apiPagoPa/anagraficaPspPA/api";
import { getProfilo, getToken } from "../../reusableFunction/actionLocalStorage";
import MultiselectWithKeyValue from "../../components/anagraficaPsp/multiselectKeyValue";
import { RequestBodyListaDocContabiliPagopa } from "../../types/typeDocumentiContabili";
import { downloadDocContabili, getListaDocumentiContabiliPa, getQuartersDocContabiliPa, getYearsDocContabiliPa } from "../../api/apiPagoPa/documentiContabiliPA/api";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CollapsibleTablePa, { DocContabili } from "../../components/reusableComponents/grid/gridCollapsible/gridCustomCollapsiblePa";
import { HeaderCollapsible } from "../../types/typeFatturazione";




const DocumentiContabili:React.FC<any> = ({dispatchMainState}) =>{
    const token =  getToken();
    const profilo =  getProfilo();


    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };


    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;

    
    const [gridData, setGridData] = useState<DocContabili[]>([]);
    const [statusAnnulla, setStatusAnnulla] = useState('hidden');
    const [filtersDownload, setFiltersDownload] = useState<RequestBodyListaDocContabiliPagopa>({
        contractIds:[],
        membershipId: '',
        recipientId: '',
        abi: '',
        quarters:[]});
    const [bodyGetLista, setBodyGetLista] = useState<RequestBodyListaDocContabiliPagopa>({
        contractIds:[],
        membershipId: '',
        recipientId: '',
        abi: '',
        quarters:[]});
    const [getListaLoading, setGetListaLoading] = useState(false);
    const [dataSelect, setDataSelect] = useState<OptionMultiselectCheckboxPsp[]>([]);
    const [dataSelectQuarter, setDataSelectQuarter] = useState<OptionMultiselectCheckboxQarter[]>([]);
    const [valueQuarters, setValueQuarters] = useState<OptionMultiselectCheckboxQarter[]>([]);
    const [textValue, setTextValue] = useState<string>('');
    const [valueAutocomplete, setValueAutocomplete] = useState<AutocompleteMultiselect[]>([]);

    const [showLoading,setShowLoading] = useState(false);

    const [yearOnSelect,setYearOnSelect] = useState<string[]>([]);
    const [valueYear,setValueYear] = useState('');

    
  
    useEffect(()=>{
        /*
        const result = getFiltersFromLocalStorage();
        const infoPageResult = getInfoPageFromLocalStorage();
       
        getProdotti();
        getProfili();
        if(Object.keys(result).length > 0){
            setBodyGetLista(result.bodyGetLista);
            setTextValue(result.textValue);
            setValueAutocomplete(result.valueAutocomplete);
            getListaDatifatturazione(result.bodyGetLista);
            setFiltersDownload(result.bodyGetLista);
        }else{
            getListaDatifatturazione(bodyGetLista);
        }
        if(infoPageResult.page > 0){
            setInfoPageListaDatiFat(infoPageResult);
        }*/
      
        getListaDocGrid(bodyGetLista);
        getYears();
    }, []);

 


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
        if(valueYear !== ''){
            getQuarters();
        }
       
    },[valueYear]);





    const getListaDocGrid = async(body:RequestBodyListaDocContabiliPagopa) =>{
        setGetListaLoading(true);
        await getListaDocumentiContabiliPa(token, profilo.nonce, body)
            .then((res)=>{
                const dataWithNewId = res.data.financialReports.map(el => {
                    el.id = el.id.toString()+el.yearQuarter;
                    return el;
                });
                setGridData(dataWithNewId);
                
                setGetListaLoading(false);
                
            })
            .catch(((err)=>{
                setGridData([]);
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
                    setValueYear(res.data[0]);
                }
            })
            .catch(((err)=>{
                manageError(err,dispatchMainState); 
            }));
    };

    const getQuarters = async () =>{
       
        await getQuartersDocContabiliPa(token, profilo.nonce,{year:valueYear})
            .then((res)=>{
                setDataSelectQuarter(res.data);
            })
            .catch(((err)=>{
                manageError(err,dispatchMainState); 
            }));
    };

    
    
    const onDownloadButton = async() =>{
        setShowLoading(true);
        
        await downloadDocContabili(token,profilo.nonce, filtersDownload).then(response => response.blob()).then((res) => {
            let fileName = '';
            if(filtersDownload.contractIds.length === 1 || gridData.length === 1){
                fileName = `Documenti contabili / ${gridData[0].name}.xlsx`;
            }else{
                fileName = `Documenti contabili.xlsx`;
            }
           
            saveAs( res,fileName );
           
            setShowLoading(false);
        }).catch(err => {
            setShowLoading(false);
            manageError(err,dispatchMainState);
        });
    };

    const onButtonFiltra = () =>{
        setFiltersDownload(bodyGetLista);
        getListaDocGrid(bodyGetLista); 
        //setFilterToLocalStorageRel(bodyRel,textValue,valueAutocomplete, 0, 10,valuetipologiaFattura);
    };
   
                
    

    const headersObjGrid : HeaderCollapsible[] = [
        {name:"",align:"left",id:1},
        {name:"Nome PSP",align:"left",id:2},
        {name:"ID Contratto",align:"center",id:3},
        {name:"Trimestre",align:"center",id:4},
        {name:"Bollo",align:"center",id:5},
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
                <div className="col-3">
                    <Box sx={{width:'80%',marginLeft:'20px'}} >
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
                                onChange={(e) => setValueYear(e.target.value)}
                                value={valueYear}
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
                        onChange={(event, value) => {
                            const arrayId = value.map(el => el.value);
                            setBodyGetLista((prev) => ({...prev,...{quarters:arrayId}}));
                            setValueQuarters(value);
                        }}
                        id="checkboxes-quarters"
                        options={dataSelectQuarter}
                        value={valueQuarters}
                        disableCloseOnSelect
                        getOptionLabel={(option:OptionMultiselectCheckboxQarter) => {
                            console.log(option,'option');
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
                <div className="col-3">
                    <Box sx={{width:'80%',marginLeft:'20px'}} >
                        <TextField
                            fullWidth
                            label='ABI'
                            placeholder='ABI'
                            value={bodyGetLista.abi}
                            onChange={(e) =>  setBodyGetLista((prev)=> ({...prev, ...{abi:e.target.value}}))}            
                        />
                    </Box>
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
                    <Box sx={{width:'80%',marginLeft:'20px'}} >
                        <TextField
                            fullWidth
                            label='Recipient ID'
                            placeholder='Recipient ID'
                            value={bodyGetLista.recipientId}
                            onChange={(e) =>  setBodyGetLista((prev)=> ({...prev, ...{recipientId:e.target.value}}))}            
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
                                        quarters:[]};
                                    getListaDocGrid(newBody);
                                    setBodyGetLista(newBody);
                                    setFiltersDownload(newBody);
                                    setDataSelect([]);
                                    setValueAutocomplete([]);
                                    setValueQuarters([]);
                                    
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
                <Button onClick={() =>
                    onDownloadButton()
                }
                disabled={getListaLoading}
                >
                Download Risultati
                    <DownloadIcon sx={{marginRight:'10px'}}></DownloadIcon>
                </Button>
                }
            </div>
            <div className="mt-1 mb-5" style={{ width: '100%'}}>
                <CollapsibleTablePa 
                    data={gridData}
                    headerNames={headersObjGrid}
                    handleModifyMainState={handleModifyMainState}
                ></CollapsibleTablePa>
            </div>
            <div>
            </div>
            <ModalLoading 
                open={showLoading} 
                setOpen={setShowLoading}
                sentence={'Downloading...'} >
            </ModalLoading>
        </div>
    );
}; 
export default DocumentiContabili;

