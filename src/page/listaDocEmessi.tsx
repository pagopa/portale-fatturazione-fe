import { Autocomplete, Box, Button, Checkbox, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import MultiselectCheckbox from "../components/reportDettaglio/multiSelectCheckbox";
import GridCustom from "../components/reusableComponents/grid/gridCustom";
import ModalLoading from "../components/reusableComponents/modals/modalLoading";
import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../store/context/globalContext";
import { ElementMultiSelect, OptionMultiselectChackbox } from "../types/typeReportDettaglio";
import useSavedFilters from "../hooks/useSaveFiltersLocalStorage";
import { PathPf } from "../types/enum";
import { saveAs } from "file-saver";
import { manageError } from "../api/api";

import { listaEntiNotifichePage } from "../api/apiSelfcare/notificheSE/api";
import SelectTipologiaFattura from "../components/reusableComponents/select/selectTipologiaFattura";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { BodyWhite, getAnniWhite, getMesiWhite, getTipologiaFatturaWhite, getWhiteListPagoPa } from "../api/apiPagoPa/whiteListPA/whiteList";
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { mesiDescNome, month } from "../reusableFunction/reusableArrayObj";
import ModalConfermaInserimento from "../components/commessaInserimento/modalConfermaInserimento";

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
    const [valueMotiselectMonths, setValueMultiMonths] = useState<{descrizione:string,mese:number}[]>([]);
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
        if((bodyGetLista?.anno || 0) > 0){
            getMesi(bodyGetLista.anno);
        }
    },[bodyGetLista.anno]);
  

    useEffect(()=>{
        if(bodyGetLista.idEnti.length !== 0 || bodyGetLista.tipologiaFattura !== '' || bodyGetLista.tipologiaContratto !== 0  ){
            setStatusAnnulla('show');
        }else{
            setStatusAnnulla('hidden');
        }
    },[bodyGetLista]);

    const getAnni = async() => {
        setShowLoading(true);
        await getAnniWhite(token, profilo.nonce).then((res)=>{
            //const arrayNumber = res.data.map(el => Number(el.toString()));
            setArrayYears(res.data); 
            getListTipologiaFattura();
            setBodyGetLista((prev)=>({...prev,...{anno:res.data[0]}}));
            getLista(1,10,{
                idEnti: [],
                tipologiaContratto: null,
                tipologiaFattura:null,
                anno: res.data[0],
                mesi: []
            });
            setShowLoading(false);
        }).catch((err)=>{
            setArrayYears([]);
            setShowLoading(false);
            manageError(err,dispatchMainState);
        });
    };
    

    const getMesi = async(y) => {
        setShowLoading(true);
        await getMesiWhite(token, profilo.nonce, {anno:y}).then((res)=>{
            setArrayMonths(res.data);
            setValueMultiMonths([]);
            setBodyGetLista((prev)=>({...prev,...{mesi:[]}}));
            
            setShowLoading(false);
        }).catch((err)=>{
            setArrayYears([]);
            setShowLoading(false);
            manageError(err,dispatchMainState);
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
            })
            .catch(((err)=>{
                manageError(err,dispatchMainState);
            }));
    };


    const getListTipologiaFattura = async() => {
      
        await getTipologiaFatturaWhite(token, profilo.nonce).then((res)=>{
            setTipologiaFatture([...['Tutte'],...res.data]);
            setBodyGetLista((prev)=> ({...prev, ...{tipologiaFattura:"Tutte"}}));
            setValueTipologiaFattura("Tutte");
        }).catch(((err)=>{
            setTipologiaFatture([]);
            setValueTipologiaFattura("");
            manageError(err,dispatchMainState);
        }));   
    };


    
    const getLista = async(pg,row,body) => {
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
            console.log(res.data);
            setGridData(customObj);
            setTotalElements(res.data.count);
            setSelected([]);
           
        }).catch(((err)=>{
            manageError(err,dispatchMainState);
        }));
               
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
                pathPage:PathPf.TIPOLOGIA_CONTRATTO,
                textValue,
                valueAutocomplete,
                page:0,
                rows:10
            });
    };
    console.log({bodyGetLista});
    const onButtonAnnulla = () => {
        //getLista(0,10,{idEnti:[],tipologiaContratto:null});
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
            tipologiaFattura:"Tutte",
            anno: arrayYears[0],
            mesi: []
        });
        setValueAutocomplete([]);
        setValueMultiMonths([]);
        setValueTipologiaFattura("Tutte");
        setTextValue('');
        resetFilters();
    };
    /*
    const onDownload = async() => {
        setShowLoading(true);
        await downloadTipologiePagopa(token, profilo.nonce,bodyGetLista).then((response) =>{
            if (response.ok) {
                return response.blob();
            }
            throw '404';
        }).then(
            (response)=>{
                let fileName = `x.xlsx`;
                if(gridData.length === 1){
                    fileName = `x.xlsx`;
                }
                setShowLoading(true);
                saveAs(response,fileName);
                setShowLoading(false);
            }).catch(err =>{
            manageError(err,dispatchMainState);
        } );
    };
*/

    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        //getLista(newPage,rowsPerPage, bodyGetLista);
        setPage(newPage);
        updateFilters({
            pathPage:PathPf.TIPOLOGIA_CONTRATTO,
            body:bodyGetLista,
            textValue,
            valueAutocomplete,
            page:newPage,
            rows:rowsPerPage
        });
    };
                    
    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        updateFilters({
            pathPage:PathPf.TIPOLOGIA_CONTRATTO,
            body:bodyGetLista,
            textValue,
            valueAutocomplete,
            page,
            rows:parseInt(event.target.value, 10)
        });
        const realPage = page + 1;
        //getLista(realPage,parseInt(event.target.value, 10),bodyGetLista);                     
    };

    const onButtonComfermaPopUp = () => {
        console.log('delete');
    };

    const headerNames = [ 'checkbox','Ragione Sociale', 'Anno', 'Mese','Tipologia fattura', 'Tipo contratto', ''];

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
    console.log({selected});
    return (
        <div className="mx-5">
            {/*title container start */}
            <div className="marginTop24 ">
                <Typography variant="h4">Lista </Typography>
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
                        sx={{width:'80%',marginLeft:'20px'}}
                        multiple
                        onChange={(event, value) => {
                            const valueArray = value.map((el) => Number(el.mese));
                            setValueMultiMonths(value);
                            setBodyGetLista((prev) => ({...prev,...{mesi:valueArray}}));
                            clearOnChangeFilter();
                        }}
                        id="checkboxes-tipologie"
                        options={arrayMonths}
                        value={valueMotiselectMonths}
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
                                label="Mesi" 
                                placeholder="Mesi" />;
                        }}     
                    />
                </div>
                <div className="col-3">
                    <SelectTipologiaFattura value={bodyGetLista.tipologiaFattura} setBody={setBodyGetLista} setValue={setValueTipologiaFattura} types={tipologiaFatture} clearOnChangeFilter={clearOnChangeFilter}></SelectTipologiaFattura>
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
                                        setBodyGetLista((prev)=> ({...prev, ...{tipologiaContratto:0}}));
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
                <Button 
                    disabled={getListaLoading}
                    onClick={()=> console.log('download')}
                >
                Download Risultati
                    <DownloadIcon sx={{marginRight:'10px'}}></DownloadIcon>
                </Button>
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
                    setOpenModal={setOpenModalAction}
                    buttons={buttonsTopHeader}
                    selected={selected}
                    setSelected={setSelected}></GridCustom>
            </div>
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
