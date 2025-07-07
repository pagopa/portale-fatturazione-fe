import { Autocomplete, Box, Button, Checkbox, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import { useContext, useEffect, useState } from "react";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { saveAs } from "file-saver";
import { manageError, managePresaInCarico } from "../../api/api";
import { listaEntiNotifichePage } from "../../api/apiSelfcare/notificheSE/api";
import { headerNames } from "../../assets/configurations/config_GridWhiteList";
import ModalConfermaInserimento from "../../components/commessaInserimento/modalConfermaInserimento";
import MultiselectCheckbox from "../../components/reportDettaglio/multiSelectCheckbox";
import GridCustom from "../../components/reusableComponents/grid/gridCustom";
import ModalLoading from "../../components/reusableComponents/modals/modalLoading";
import ModalAggiungi from "../../components/whiteList/modalAggiungi";
import useSavedFilters from "../../hooks/useSaveFiltersLocalStorage";
import { month } from "../../reusableFunction/reusableArrayObj";
import { GlobalContext } from "../../store/context/globalContext";
import { PathPf } from "../../types/enum";
import { ElementMultiSelect, OptionMultiselectChackbox } from "../../types/typeReportDettaglio";
import { BodyWhite, getAnniWhite, getMesiWhite, getTipologiaFatturaWhite, getWhiteListPagoPa, deleteWhiteListPagoPa, downloadWhiteListPagopa } from "../../api/apiPagoPa/whiteListPA/whiteList";



export interface BodyLista {
    idEnti: string[]
    tipologiaContratto: number|null
    tipologiaFattura: string
    anno: number
    mese: number
}
export interface WhitelistData {
    count: number
    whitelist: Whitelist[]
}
export interface Whitelist {
    idWhite?: number;
    ragioneSociale:string;
    anno: number;
    mese: number;
    tipologiaFatture: string;
    tipoContratto: string;
    cancella?:boolean;
}

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const ListaDocEmessi = () => {
    const globalContextObj = useContext(GlobalContext);
    const {dispatchMainState,mainState} = globalContextObj;
    
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;

    const [gridData, setGridData] = useState<Whitelist[]>([]);
    const [statusAnnulla, setStatusAnnulla] = useState('hidden');
    const [getListaLoading, setGetListaLoading] = useState(false);
    const [dataSelect, setDataSelect] = useState<ElementMultiSelect[]>([]);
    const [textValue, setTextValue] = useState('');
    const [valueAutocomplete, setValueAutocomplete] = useState<OptionMultiselectChackbox[]>([]);
    const [valueSelectMonths, setValueSelectMonths] = useState<{descrizione:string,mese:number}[]>([]);
    const [showLoading,setShowLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalElements, setTotalElements]  = useState(0);
    const [arrayYears,setArrayYears] = useState<number[]>([]);
    const [arrayMonths,setArrayMonths] = useState<{descrizione:string,mese:number}[]>([]);
    const [contratti, setContratti] = useState([{id:0,descrizione:"Tutte"},{id:2,descrizione:"PAC"},{id:1,descrizione:"PAL"}]);
    const [valuetipologiaFattura, setValueTipologiaFattura] = useState<string>('');
    const [tipologiaFatture, setTipologiaFatture] = useState<string[]>([]);
    const [openModalAction, setOpenModalAction] = useState(false);
    const [openModalAdd, setOpenModalAdd] = useState(false);
  
    const [selected, setSelected] = useState<number[]>([]);
    const [bodyGetLista, setBodyGetLista] = useState<BodyWhite>({
        idEnti: [],
        tipologiaContratto:null,
        tipologiaFattura:null,
        anno: null,
        mesi: []
    });
 
    const { 
        filters,
        updateFilters,
        resetFilters,
        isInitialRender
    } = useSavedFilters(PathPf.LISTA_DOC_EMESSI,{});

    useEffect(()=>{
        getAnni();
    },[]);

    useEffect(()=>{
        if((bodyGetLista.anno || 0) > 0 && !isInitialRender.current){
            getMesi(bodyGetLista.anno);
        }
    },[bodyGetLista.anno]);

    useEffect(()=>{
        if(!isInitialRender.current){
            updateFilters( {
                selected:selected
            });
        } 
    },[selected]);
  

    useEffect(()=>{
        if(bodyGetLista.idEnti.length !== 0 || bodyGetLista.mesi.length !== 0 || bodyGetLista.tipologiaFattura !== null || bodyGetLista.tipologiaContratto !== null  ){
            setStatusAnnulla('show');
        }else{
            setStatusAnnulla('hidden');
        }
    },[bodyGetLista]);

    const getAnni = async(year = null, action = '' ) => {
        await getAnniWhite(token, profilo.nonce).then(async(res)=>{
            setArrayYears(res.data);
            await getListTipologiaFattura();
            if(isInitialRender.current && Object.keys(filters).length > 0){
                //se ci sono gli anni ed è il primorender e ci sono i filtri nella local storage
                setBodyGetLista(filters.body);
                await getMesi(filters.body.anno);
                await getLista(filters.page+1, filters.rows,filters.body);
                setPage(filters.page);
                setRowsPerPage(filters.rows);
                setTextValue(filters.textValue);
                setValueAutocomplete(filters.valueAutocomplete);
                setSelected(filters.selected);
            }else{
                setGetListaLoading(true);
                setPage(0);
                setRowsPerPage(10);
                setValueSelectMonths([]);
                setValueAutocomplete([]);
                if(res.data.length === 0){
                    //se NON ci sono gli anni
                    setBodyGetLista({
                        idEnti: [],
                        tipologiaContratto:null,
                        tipologiaFattura:null,
                        anno: null,
                        mesi: []
                    });
                    setArrayMonths([]);
                    setGridData([]);
                    setTotalElements(0);
                }else if(year &&( action === 'Add' || (action === 'Delete' && res.data.includes(year) ))){
                    const bodyToSet = {
                        idEnti: [],
                        tipologiaContratto: null,
                        tipologiaFattura:null,
                        anno: year,
                        mesi: []
                    };
                    setBodyGetLista(bodyToSet);
                    await getMesi(year);
                    await getLista(1,10,bodyToSet);
                }else if(year && action === 'Delete' &&  !res.data.includes(year)){
        
                    const bodyToSet = {
                        idEnti: [],
                        tipologiaContratto: null,
                        tipologiaFattura:null,
                        anno: res.data[0],
                        mesi: []
                    };
                    setBodyGetLista(bodyToSet);
                    await getMesi(res.data[0]);
                    await getLista(1,10,bodyToSet);
                   
                }else{
                    setBodyGetLista((prev)=>({...prev,...{anno:res.data[0]}}));
                    await getMesi(res.data[0]);
                    await getLista(1,10,{
                        idEnti: [],
                        tipologiaContratto: null,
                        tipologiaFattura:null,
                        anno: res.data[0],
                        mesi: []
                    });
                }  
                
            }
            setGetListaLoading(false);
        }).catch((err)=>{
            setArrayYears([]);
            setArrayMonths([]);
            setGetListaLoading(false);
            manageError(err,dispatchMainState);
        });
    };
    
    const getMesi = async(y) => {
        setGetListaLoading(true);
        await getMesiWhite(token, profilo.nonce, {anno:y}).then((res)=>{
            setArrayMonths(res.data);
            if(isInitialRender.current && Object.keys(filters).length > 0){
                setValueSelectMonths(filters.valueSelectMonths);
            }else{
                setValueSelectMonths([]);
                setBodyGetLista((prev)=>({...prev,...{mesi:[]}}));
            }
            setGetListaLoading(false);
            isInitialRender.current = false;
        }).catch((err)=>{
            setArrayYears([]);
            setGetListaLoading(false);
            manageError(err,dispatchMainState);
            isInitialRender.current = false;
        });
    };

    useEffect(()=>{
        const timer = setTimeout(() => {
            if(textValue.length >= 3){ 
                listaEntiPageOnSelect();
            }
        }, 800);
        return () => clearTimeout(timer);
    },[textValue]);
    
    const listaEntiPageOnSelect = async () =>{
        await listaEntiNotifichePage(token, profilo.nonce, {descrizione:textValue} )
            .then((res)=>{
                setDataSelect(res.data);
            }).catch(((err)=>{
                manageError(err,dispatchMainState);
            }));
    };


    const getListTipologiaFattura = async() => {
        await getTipologiaFatturaWhite(token, profilo.nonce).then((res)=>{
            setTipologiaFatture([...["Tutte"],...res.data]);
            if(isInitialRender.current && Object.keys(filters).length > 0){
                setValueTipologiaFattura(filters.valuetipologiaFattura);
            }else{
                setBodyGetLista((prev)=> ({...prev, ...{tipologiaFattura:null}}));
                setValueTipologiaFattura("Tutte");
            }
        }).catch(((err)=>{
            setTipologiaFatture([]);
            setValueTipologiaFattura("");
            manageError(err,dispatchMainState);
        }));   
    };

    const getLista = async(pg,row,body) => {
        setGetListaLoading(true);
        await getWhiteListPagoPa(token, profilo.nonce,pg,row,body).then((res)=>{
            const customObj = res.data.whitelist.map(el => {
                return {
                    idWhite:el.id,
                    ragioneSociale:el.ragioneSociale,
                    anno:el.anno,
                    mese:month[el.mese-1],
                    tipologiaFatture:el.tipologiaFattura,
                    tipoContratto:el.tipoContratto,
                    cancella:el.cancella
                };
            });
            setGridData(customObj);
            setTotalElements(res.data.count);
            setGetListaLoading(false);
        }).catch(((err)=>{
            setGridData([]);
            setTotalElements(0);
            setGetListaLoading(false);
            manageError(err,dispatchMainState);
        }));     
    };

    const deleteElements = async (y) => {
        setGetListaLoading(true);
        resetFilters();
        await deleteWhiteListPagoPa(token, profilo.nonce,selected).then(async(res)=> {
            await getAnni(y, 'Delete'); 
            managePresaInCarico('INSER_DELETE_WHITE_LIST',dispatchMainState);
            setSelected([]);
        }).catch((err)=>{
            setGetListaLoading(false);
            manageError(err,dispatchMainState);
        });
    };

    const onButtonAggiungi = async(yearAdd) => {
        resetFilters();
        getAnni(yearAdd, "Add");
    };

    const clearOnChangeFilter = () => {
        setGridData([]);
        setSelected([]);
    };

    const onButtonFiltra = () => {
        getLista(1,10,bodyGetLista);
        updateFilters(
            {
                body:bodyGetLista,
                pathPage:PathPf.LISTA_DOC_EMESSI,
                textValue,
                valueAutocomplete,
                valueSelectMonths,
                valuetipologiaFattura,
                page:0,
                rows:10,
                selected:selected
            });
        setPage(0);
        setRowsPerPage(10);
        setSelected([]);
    };

 
    const onButtonAnnulla = () => {
        getLista(1,10,{
            idEnti: [],
            tipologiaContratto: null,
            tipologiaFattura:null,
            anno: arrayYears[0],
            mesi: []
        });
        setBodyGetLista({
            idEnti: [],
            tipologiaContratto: null,
            tipologiaFattura:null,
            anno: arrayYears[0],
            mesi: []
        });
        setValueAutocomplete([]);
        setValueSelectMonths([]);
        setValueTipologiaFattura("Tutte");
        setTextValue('');
        resetFilters();
    };

    
    const onDownload = async() => {
        setShowLoading(true);
        await downloadWhiteListPagopa(token, profilo.nonce,bodyGetLista).then((response) =>{
            if (response.ok) {
                return response.blob();
            }
            throw '404';
        }).then(
            (response)=>{
                let fileName = `White list Fatturazione/${bodyGetLista.anno}.xlsx`;
                if(bodyGetLista.idEnti.length === 1){
                    fileName = `White list Fatturazione/${dataSelect[0].descrizione}/${bodyGetLista.anno}.xlsx`;
                }
                if(bodyGetLista.idEnti.length === 1 && bodyGetLista.mesi.length === 1){
                    fileName = `White list Fatturazione/${dataSelect[0].descrizione}/${month[bodyGetLista?.mesi[0] -1]}/${bodyGetLista.anno}.xlsx`;
                }
                
                setShowLoading(true);
                saveAs(response,fileName);
                setShowLoading(false);
            }).catch(err =>{
            setShowLoading(false);
            manageError(err,dispatchMainState);
        } );
    };


    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        getLista(newPage + 1,rowsPerPage, bodyGetLista);
        setPage(newPage);
        updateFilters({
            pathPage:PathPf.LISTA_DOC_EMESSI,
            body:bodyGetLista,
            textValue,
            valueAutocomplete,
            valueSelectMonths,
            valuetipologiaFattura,
            page:newPage,
            rows:rowsPerPage,
            selected:selected
        });
    };
                    
    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
        updateFilters({
            pathPage:PathPf.LISTA_DOC_EMESSI,
            body:bodyGetLista,
            textValue,
            valueAutocomplete,
            valueSelectMonths,
            valuetipologiaFattura,
            page:0,
            rows:parseInt(event.target.value, 10),
            selected:selected
        });
    
        getLista(1,parseInt(event.target.value, 10),bodyGetLista);                     
    };

    const onButtonComfermaPopUp = () => {
        deleteElements(bodyGetLista.anno);
    };

    const buttonsTopHeader =  [
        {
            stringIcon:"Elimina",
            icon:<DeleteIcon sx={{ color: selected.length > 0 ? "#1976D2":"#A2ADB8" , cursor: 'pointer' }} />,
            action:"Delete",
        },
        {
            stringIcon:"Aggiungi",
            icon:<AddCircleIcon sx={{ color:selected.length === 0 ? "#1976D2" : "#A2ADB8", cursor: 'pointer' }} />,
            action:"Add"
        }];

   

    return (
        <div className="mx-5">
            {/*title container start */}
            <div className="marginTop24 ">
                <Typography variant="h4">White list </Typography>
            </div>
            {/*title container end */}
            <div className="row mb-5 mt-5" >
                <div className="col-3">
                    <Box sx={{width:'80%'}} >
                        <FormControl
                            fullWidth
                            size="medium"
                        >
                            <InputLabel>
                            Anno   
                            </InputLabel>
                            <Select
                                label='Seleziona Anno'
                                onChange={(e) => {
                                    clearOnChangeFilter();  
                                    const value = Number(e.target.value);
                                    setBodyGetLista((prev)=> ({...prev, ...{anno:value}}));
                                }}
                                value={bodyGetLista.anno||''}     
                            >
                                {arrayYears.map((el) => (
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
                <div  className="col-3">
                    <Autocomplete
                        limitTags={1}
                        sx={{width:'80%'}}
                        multiple
                        onChange={(event, value) => {
                            const valueArray = value.map((el) => Number(el.mese));
                            setValueSelectMonths(value);
                            setBodyGetLista((prev) => ({...prev,...{mesi:valueArray}}));
                            clearOnChangeFilter();
                        }}
                        isOptionEqualToValue={(option, value) => option.descrizione === value.descrizione}
                        options={arrayMonths}
                        value={valueSelectMonths}
                        disableCloseOnSelect
                        getOptionLabel={(option) => option.descrizione}
                        renderOption={(props, option,{ selected }) =>(
                            <li {...props}>
                                <Checkbox
                                    icon={icon}
                                    checkedIcon={checkedIcon}
                                    style={{ marginRight: 8 }}
                                    checked={selected}
                                />
                                {option.descrizione}
                            </li>
                        )}
                        style={{ width: '80%',height:'59px' }}
                        renderInput={(params) => {
                            return <TextField {...params}
                                sx={{backgroundColor:"#F2F2F2"}}
                                label="Mesi" 
                                placeholder="Mesi" />;
                        }}     
                    />
                </div>
                <div className="col-3">
                    <Box  style={{ width: '80%' }}>
                        <FormControl
                            fullWidth
                            size="medium"
                        >
                            <InputLabel
                            >
                                Tipologia Fattura  
                            </InputLabel>
                            <Select
                                label='Seleziona Prodotto'
                                onChange={(e) =>{
                                    if(e.target.value){
                                        setValueTipologiaFattura(e.target.value);
                                        if(e.target.value === "Tutte"){
                                            setBodyGetLista((prev)=>({...prev,...{tipologiaFattura:null}}));
                                        }else{
                                            setBodyGetLista((prev)=>({...prev,...{tipologiaFattura:e.target.value}}));
                                        }
                                    }
                                    clearOnChangeFilter();
                                }}     
                                value={valuetipologiaFattura}       
                            >
                                {tipologiaFatture.map((el) => (            
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
                    <Box  style={{ width: '80%' }}>
                        <FormControl
                            fullWidth
                            size="medium"
                        >
                            <InputLabel>
                                Tipologia contratto
                            </InputLabel>
                            <Select
                                label="Tipologia contratto"
                                onChange={(e) =>{
                                    clearOnChangeFilter();
                                    if(e.target.value === 0){
                                        setBodyGetLista((prev)=> ({...prev, ...{tipologiaContratto:null}}));
                                    }else{
                                        setBodyGetLista((prev)=> ({...prev, ...{tipologiaContratto:Number(e.target.value)}}));
                                    }
                                }}
                                value={bodyGetLista.tipologiaContratto === null ? 0 : bodyGetLista.tipologiaContratto}
                            >
                                {contratti.map((el) => (
                                    <MenuItem
                                        key={el.id}
                                        value={el.id}
                                    >
                                        {el.descrizione}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </div>
            </div>
            <div className="row mb-5 mt-5" >
                <div  className="col-3">
                    <MultiselectCheckbox 
                        setBodyGetLista={setBodyGetLista}
                        dataSelect={dataSelect}
                        setTextValue={setTextValue}
                        valueAutocomplete={valueAutocomplete}
                        setValueAutocomplete={setValueAutocomplete}
                        clearOnChangeFilter={clearOnChangeFilter}
                    ></MultiselectCheckbox>
                </div>
            </div>
            <div className="d-flex">
                <div className=" d-flex justify-content-center align-items-center">
                    <div>
                        <Button 
                            onClick={onButtonFiltra} 
                            disabled={bodyGetLista.anno === null}
                            sx={{ marginTop: 'auto', marginBottom: 'auto'}}
                            variant="contained"> Filtra
                        </Button>
                        {statusAnnulla === 'hidden'? null :
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
                {gridData.length > 0 &&
                <Button 
                    disabled={getListaLoading}
                    onClick={onDownload}
                >
                Download Risultati
                    <DownloadIcon sx={{marginRight:'10px'}}></DownloadIcon>
                </Button>}
            </div>
            <div className="mt-1 mb-5" style={{ width: '100%'}}>
                <GridCustom
                    nameParameterApi='idWhite'
                    elements={gridData}
                    changePage={handleChangePage}
                    changeRow={handleChangeRowsPerPage} 
                    total={totalElements}
                    page={page}
                    rows={rowsPerPage}
                    headerNames={headerNames}
                    disabled={false}
                    widthCustomSize="auto"
                    setOpenModalDelete={setOpenModalAction}
                    setOpenModalAdd={setOpenModalAdd}
                    buttons={buttonsTopHeader}
                    selected={selected}
                    setSelected={setSelected}></GridCustom>
            </div>
          
            <ModalAggiungi 
                getLista={onButtonAggiungi}
                open={openModalAdd}
                setOpen={setOpenModalAdd} ></ModalAggiungi>
            <ModalLoading 
                open={getListaLoading} 
                setOpen={setGetListaLoading}
                sentence={'Loading...'} >
            </ModalLoading>
            <ModalLoading 
                open={showLoading} 
                setOpen={setShowLoading}
                sentence={'Downloading...'} >
            </ModalLoading>
            <ModalConfermaInserimento
                setOpen={setOpenModalAction}
                open={openModalAction}
                onButtonComfermaPopUp={onButtonComfermaPopUp}
                mainState={mainState}
                sentence={"Sei sicuro di voler procedere"}
            ></ModalConfermaInserimento>
        </div>
    );
};
export default ListaDocEmessi;
