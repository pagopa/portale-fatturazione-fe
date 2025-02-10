import { Typography } from "@mui/material";
import { Box, FormControl, InputLabel,Select, MenuItem, Button} from '@mui/material';
import {manageError, managePresaInCarico, } from '../api/api';
import { GridElementListaFatturazione } from "../types/typeListaDatiFatturazione";
import { useContext, useEffect, useState } from "react";
import {  GridRowParams,GridEventListener,MuiEvent} from '@mui/x-data-grid';
import DownloadIcon from '@mui/icons-material/Download';
import ModalLoading from "../components/reusableComponents/modals/modalLoading";
import { PathPf } from "../types/enum";
import MultiselectCheckbox from "../components/reportDettaglio/multiSelectCheckbox";
import { ElementMultiSelect, OptionMultiselectChackbox } from "../types/typeReportDettaglio";
import { listaEntiNotifichePage } from "../api/apiSelfcare/notificheSE/api";
import { GlobalContext } from "../store/context/globalContext";
import useSavedFilters from "../hooks/useSaveFiltersLocalStorage";
import GridCustom from "../components/reusableComponents/grid/gridCustom";
import ModalConfermaInserimento from "../components/commessaInserimento/modalConfermaInserimento";
import { getListaTipologiaFatturazionePagoPa } from "../api/apiPagoPa/tipologiaContratto/api";
import { Params } from "../types/typesGeneral";


export interface BodyContratto {
    idEnti:{idEnte:string}[],
    tipologiaContratto:number|null
}


const PageTipologiaContratto :React.FC = () =>{
    const globalContextObj = useContext(GlobalContext);
    const {dispatchMainState,mainState} = globalContextObj;

    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;

    const [contratti, setContratti] = useState([{id:0,descrizione:"Tutte"},{id:2,descrizione:"PAC"},{id:1,descrizione:"PAL"}]);
    const [gridData, setGridData] = useState<GridElementListaFatturazione[]>([]);
    const [statusAnnulla, setStatusAnnulla] = useState('hidden');
    const [getListaLoading, setGetListaLoading] = useState(false);
    const [dataSelect, setDataSelect] = useState<ElementMultiSelect[]>([]);
    const [bodyGetLista, setBodyGetLista] = useState<BodyContratto>({idEnti:[],tipologiaContratto:null});
    const [textValue, setTextValue] = useState('');
    const [valueAutocomplete, setValueAutocomplete] = useState<OptionMultiselectChackbox[]>([]);
    const [showLoading,setShowLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalContratti, setTotalContratti]  = useState(0);
    const [sentence , setSentence] = useState<any>();
    const [openModalConfermaIns, setOpenModalConfermaIns] = useState(false);
    const { 
        filters,
        updateFilters,
        resetFilters,
        isInitialRender
    } = useSavedFilters(PathPf.TIPOLOGIA_CONTRATTO,{});

    useEffect(()=>{
        getLista(page, rowsPerPage, bodyGetLista);

    },[]);


    useEffect(()=>{
        if(bodyGetLista.idEnti?.length  !== 0 || bodyGetLista.tipologiaContratto !== null){
            setStatusAnnulla('show');
        }else{
            setStatusAnnulla('hidden');
        }
    },[bodyGetLista]);

    

    useEffect(()=>{
        const timer = setTimeout(() => {
            if(textValue.length >= 3){ 
                listaEntiPageOnSelect();
            }
        }, 800);
        return () => clearTimeout(timer);
    },[textValue]);

  



    // servizio che popola la select con la checkbox
    const listaEntiPageOnSelect = async () =>{
        await listaEntiNotifichePage(token, profilo.nonce, {descrizione:textValue} )
            .then((res)=>{
                setDataSelect(res.data);
            })
            .catch(((err)=>{
                manageError(err,dispatchMainState);
            }));
    };

    const getLista = async( p, rows, body) => {
        await getListaTipologiaFatturazionePagoPa(token, profilo.nonce, (p + 1), rows, body).then((res)=>{
            setTotalContratti(res.data.count);

            const dataToInsert = res.data.contratti.map((el)=> {
                const result = {
                    idContratto:el.idContratto,
                    ragioneSociale:el.ragioneSociale,
                    ultimaModificaContratto:new Date(el.ultimaModificaContratto).toLocaleString().split(',')[0] || '',
                    tipoContratto:el.tipoContratto
                };
                return result;
            });
            setGridData(dataToInsert);
        }).catch(((err)=>{
            setTotalContratti(0);
            setGridData([]);
            manageError(err,dispatchMainState);
        }));
    };

   

    let columsSelectedGrid = '';
    const handleOnCellClick = (params:Params) =>{
        columsSelectedGrid  = params.field;
    };

    const handleEvent: GridEventListener<'rowClick'> = (
        params:GridRowParams,
        event: MuiEvent<React.MouseEvent<HTMLElement>>,
    ) => {
        event.preventDefault();
        // l'evento verrà eseguito solo se l'utente farà il clik sul 
        if(columsSelectedGrid === 'action' ){
            console.log("switch");
        }
    };


    const clearOnChangeFilter = () => {
        setGridData([]);
    };


    const onButtonFiltra = () => {
        getLista(0,10,bodyGetLista);
        /*
        updateFilters(
            {
                body:null,
                pathPage:PathPf.TIPOLOGIA_CONTRATTO,
                textValue,
                valueAutocomplete,
                page:0,
                rows:10
            });*/
    };

    const onButtonAnnulla = () => {
        getLista(0,10,{idEnti:[],tipologiaContratto:null});
        setBodyGetLista({idEnti:[],tipologiaContratto:null});
    };
    console.log({page,rowsPerPage});

    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        getLista(newPage,rowsPerPage, bodyGetLista);
        console.log({newPage});
        setPage(newPage);
        /*
        updateFilters({
            pathPage:PathPf.LISTA_NOTIFICHE,
            body:bodyDownload,
            textValue,
            valueAutocomplete,
            page:newPage,
            rows:rowsPerPage,
            valueFgContestazione
        });*/
        console.log('change page');
    };
                    
    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        /*updateFilters({
            pathPage:PathPf.LISTA_NOTIFICHE,
            body:bodyDownload,
            textValue,
            valueAutocomplete,
            page,
            rows:parseInt(event.target.value, 10),
            valueFgContestazione
        });*/
        const realPage = page + 1;
        getLista(realPage,parseInt(event.target.value, 10),bodyGetLista);
     
                          
    };

    console.log({bodyGetLista});

    const changeContractType = (el) => {

        const old = el.contractType === 0 ? 'PAC' : 'PAL';
        const newC = el.contractType === 1 ? 'PAL' : 'PAC';
        const tag = <Typography>Stai modificando la tipologia contratto da {old} a<Box className="ms-2" component="span" fontWeight="bold">{newC}</Box> del comune di <Box component="span" fontWeight="bold">
            { el.name} </Box>: confermi l'operazione?</Typography>;
        setSentence(tag);
        setOpenModalConfermaIns(true);
       
    };
      

    const headerNames = [ 'Ragione Sociale' , 'Data ultima modifica' , ''];


    const onButtonComfermaPopUp = () => {

        managePresaInCarico('CAMBIO_TIPOLOGIA_CONTRATTO',dispatchMainState);
    };

    return(
        <div className="mx-5">
            {/*title container start */}
            <div className="marginTop24 ">
                <Typography variant="h4">Tipologia contratto</Typography>
            </div>
            {/*title container end */}
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
                >
                Download Risultati
                    <DownloadIcon sx={{marginRight:'10px'}}></DownloadIcon>
                </Button>
            </div>
            <div className="mt-1 mb-5" style={{ width: '100%'}}>
                <GridCustom
                    nameParameterApi='idContratto'
                    elements={gridData}
                    changePage={handleChangePage}
                    changeRow={handleChangeRowsPerPage} 
                    total={totalContratti}
                    page={page}
                    rows={rowsPerPage}
                    headerNames={headerNames}
                    apiGet={changeContractType}
                    disabled={false}
                    widthCustomSize="auto"></GridCustom>
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
                setOpen={setOpenModalConfermaIns}
                open={openModalConfermaIns}
                onButtonComfermaPopUp={onButtonComfermaPopUp}
                mainState={mainState}
                sentence={sentence}
            ></ModalConfermaInserimento>
        </div>
    );
}; 
export default PageTipologiaContratto;