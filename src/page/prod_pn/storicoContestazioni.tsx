import { Autocomplete, Box, Button, Checkbox, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import { mesi, month } from "../../reusableFunction/reusableArrayObj";
import MultiselectCheckbox from "../../components/reportDettaglio/multiSelectCheckbox";
import { useContext, useEffect, useState } from "react";
import { ElementMultiSelect, OptionMultiselectChackbox } from "../../types/typeReportDettaglio";
import { manageError } from "../../api/api";
import { listaEntiNotifichePage } from "../../api/apiSelfcare/notificheSE/api";
import { GlobalContext } from "../../store/context/globalContext";
import { getListaStorico, getTipoReportCon } from "../../api/apiPagoPa/storicoContestazioni/api";
import { getAnniContestazioni } from "../../api/apiPagoPa/notifichePA/api";
import GridCustom from "../../components/reusableComponents/grid/gridCustom";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { findStatoContestazioni } from "../../reusableFunction/function";
import ModalLoading from "../../components/reusableComponents/modals/modalLoading";

export interface BodyStoricoContestazioni{
    anno:string,
    mese:string,
    idEnti:string[],
    idTipologiaReports:number[]
}

interface TipologieDoc {
    idTipologiaReport: number,
    categoriaDocumento: string,
    tipologiaDocumento: string
}

export interface ContestazioneRowGrid {
    reportId: string,
    uniqueId: string,
    json: string,
    anno: number,
    mese: number,
    internalOrganizationId: string,
    contractId: string,
    actualContractId: string,
    utenteId: string,
    prodotto: string,
    stato: number,
    dataInserimento: string,
    dataStepCorrente: string,
    linkDocumento: string,
    storage: string,
    hash: string,
    contentType: string,
    contentLanguage: string,
    tipologiaDocumento: string,
    categoriaDocumento: string,
    ragioneSociale: string
}

const Storico = () => {

    const globalContextObj = useContext(GlobalContext);
    const {dispatchMainState,mainState} = globalContextObj;
     
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;


    const [bodyGetLista,setBodyGetLista] = useState<BodyStoricoContestazioni>({
        anno:'',
        mese:'',
        idEnti:[],
        idTipologiaReports:[]
    });
    const [valueYears, setValueYears] = useState<string[]>([]);
    const [tipologieDoc, setTipologieDoc] = useState<TipologieDoc[]>([]);
    const [tipologiaSelcted,setTipologiaSelected] = useState<TipologieDoc[]>([]);
    const [dataSelect, setDataSelect] = useState<ElementMultiSelect[]>([]);
    const [textValue, setTextValue] = useState('');
    const [valueAutocomplete, setValueAutocomplete] = useState<OptionMultiselectChackbox[]>([]);
    const [statusAnnulla, setStatusAnnulla] = useState('hidden');
    const [dataGrid,setDataGrid] = useState<ContestazioneRowGrid[]>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalContestazioni, setTotalContestazioni]  = useState(0);
    const [getListaContestazioniRunning, setGetListaContestazioniRunning] = useState(false);


    useEffect(()=>{
        listaTipoReport(); 
        getAnni();
       
    },[]);

    useEffect(()=>{
        const timer = setTimeout(() => {
            if(textValue.length >= 3){
                listaEntiNotifichePageOnSelect();
            }
        }, 800);
        return () => clearTimeout(timer);
    },[textValue]);

  
    const listaEntiNotifichePageOnSelect = async () =>{
        await listaEntiNotifichePage(token, profilo.nonce, {descrizione:textValue} )
            .then((res)=>{
                setDataSelect(res.data);
            })
            .catch(((err)=>{
                setDataSelect([]);
                manageError(err,dispatchMainState);
            }));
    };

    const listaTipoReport = async () =>{
        await getTipoReportCon(token, profilo.nonce)
            .then((res)=>{
                setTipologieDoc(res.data);
            })
            .catch(((err)=>{
                setTipologieDoc([]);
                manageError(err,dispatchMainState);
            }));
    };

    const getAnni = async() => {
        setGetListaContestazioniRunning(true);
        await getAnniContestazioni(token,profilo.nonce)
            .then((res)=>{
                setBodyGetLista((prev)=> ({...prev, ...{anno:res.data[0]}}));
                setValueYears(res.data);
                getListaContestazioni({...bodyGetLista,...{anno:res.data[0]}},page+1,rowsPerPage);
            })
            .catch((err)=>{
                setGetListaContestazioniRunning(false);
                manageError(err,dispatchMainState);
            });
    };

    const getListaContestazioni = async(body,pag, rowpag) => {
        
        await getListaStorico(token,profilo.nonce,body,pag,rowpag)
            .then((res)=>{

                // ordino i dati in base all'header della grid
                const orderDataCustom = res.data.reports.map((obj)=>{
                    // inserire come prima chiave l'id se non si vuol renderlo visibile nella grid
                    // 'id serve per la chiamata get dettaglio dell'elemento selezionato nella grid
                    return {
                        uniqueId:obj.uniqueId,
                        ragioneSociale:obj.ragioneSociale,
                        categoriaDocumento:obj.categoriaDocumento,
                        stato:findStatoContestazioni(obj.stato),
                        mese:month[obj.mese-1],
                        anno:obj.anno,
                        dataInserimento:new Date(obj.dataInserimento).toISOString().split('T')[0]
                    };
                });
                setDataGrid(orderDataCustom);
                setTotalContestazioni(res.data.count);
                setGetListaContestazioniRunning(false);
            })
            .catch((err)=>{
                setGetListaContestazioniRunning(false);
                manageError(err,dispatchMainState);
            });
    };


    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        const realPage = newPage + 1;
        getListaContestazioni(bodyGetLista,realPage, rowsPerPage);
        setPage(newPage);
      
        //setFilterToLocalStorageRel(bodyDownload,textValue,valueAutocomplete, newPage, rowsPerPage,valuetipologiaFattura);
    };
                    
    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
        const realPage = page + 1;
        getListaContestazioni(bodyGetLista,realPage,parseInt(event.target.value, 10));
   
        //setFilterToLocalStorageRel(bodyDownload,textValue,valueAutocomplete, page, parseInt(event.target.value, 10),valuetipologiaFattura);
    };


    const setIdContestazione = async(el) => {
        //handleModifyMainState({relSelected:el});
        //navigate(PathPf.PDF_REL);
        console.log('ciao');
    };  

    console.log(bodyGetLista);

    return (
        <div className="mx-5" style={{minHeight:'600px'}}>
            <div className="marginTop24">
                <div className="row ">
                    <div className="col-9">
                        <Typography variant="h4">Storico contestazioni</Typography>
                    </div>
                </div>
                <div className="mb-5 mt-5 marginTop24" >
                    <div className="row">
                        <div className="col-3">
                            <Box sx={{ width: '80%' }}>
                                <FormControl
                                    fullWidth
                                    size="medium"
                                >
                                    <InputLabel
                                        id="sea"
                                    >
                                Anno
                                    </InputLabel>
                                    <Select
                                        id="sea"
                                        label='Anno'
                                        onChange={(e) =>{
                                            setBodyGetLista((prev)=> ({...prev, ...{anno:e.target.value}}));
                                        }  }
                                        value={bodyGetLista.anno||''}
                                    >
                                        {valueYears.map((el:string) => (
                                            <MenuItem
                                                key={Math.random()}
                                                value={el||''}
                                            >
                                                {el}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                        </div>
                        <div className="col-3">
                            <Box sx={{ width: '80%' }}>
                                <FormControl
                                    fullWidth
                                    size="medium"
                                >
                                    <InputLabel
                                        id="sea"
                                    >
                                Mese
                                    </InputLabel>
                                    <Select
                                        id="sea"
                                        label='Seleziona Prodotto'
                                        labelId="search-by-label"
                                        onChange={(e) =>{
                                            setBodyGetLista((prev)=> ({...prev, ...{mese:e.target.value}}));
                                        }}
                                        value={bodyGetLista.mese}
                                    >
                                        {mesi.map((el) => (
                                            <MenuItem
                                                key={Math.random()}
                                                value={Object.keys(el)[0].toString()}
                                            >
                                                {Object.values(el)[0]}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                        </div>
                        <div className="col-3 "> 
                            <Autocomplete
                                sx={{width:'80%'}}
                                multiple
                                onChange={(event, value) => {
                                    console.log(value);
                                    setTipologiaSelected(value);
                                    const allId = value.map(el => el.idTipologiaReport);
                                    setBodyGetLista((prev) => ({...prev,...{idTipologiaReports:allId}}));
                                }}
                                id="checkboxes-tipologie"
                                limitTags={1}
                                value={tipologiaSelcted}
                                options={tipologieDoc}
                                disableCloseOnSelect
                                getOptionLabel={(option:TipologieDoc) => option.categoriaDocumento}
                                renderOption={(props, option,{ selected }) =>(
                                    <li {...props}>
                                        <Checkbox
                                            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                                            checkedIcon={<CheckBoxIcon fontSize="small" />}
                                            style={{ marginRight: 8 }}
                                            checked={selected}
                                        />
                                        { option.categoriaDocumento}
                                    </li>
                                )}
                                style={{ width: '80%',height:'59px' }}
                                renderInput={(params) => {
                
                                    return <TextField {...params}
                                        label="Categoria Doc." 
                                        placeholder="Categoria Doc." />;
                                }}
           
                            />
                        </div>
                        <div  className="col-3">
                            <MultiselectCheckbox 
                                setBodyGetLista={setBodyGetLista}
                                dataSelect={dataSelect}
                                setTextValue={setTextValue}
                                valueAutocomplete={valueAutocomplete}
                                setValueAutocomplete={setValueAutocomplete}
                            ></MultiselectCheckbox>
                        </div>
                    </div>
                    <div className="d-flex mt-5">
                
                        <div className=" d-flex justify-content-center align-items-center">
                            <div>
                                <Button 
                                    onClick={()=>{
                                        setGetListaContestazioniRunning(true);
                                        getListaContestazioni(bodyGetLista,page+1,rowsPerPage);
                                        /*
                                        setInfoPageListaCom({ page: 0, pageSize: 100 });
                                        setInfoPageToLocalStorageCommessa({ page: 0, pageSize: 100 });
                                        getListaCommesse(bodyGetLista);
                                        setBodyDownload(bodyGetLista);
                                        setFilterToLocalStorageCommessa(bodyGetLista,textValue,valueAutocomplete);
                                   */ } } 
                                    sx={{ marginTop: 'auto', marginBottom: 'auto'}}
                                    variant="contained"> Filtra
                                </Button>
                                {statusAnnulla === 'hidden' ? null :
                                    <Button
                                        onClick={()=>{
                                            setGetListaContestazioniRunning(true);
                                            getListaContestazioni({...bodyGetLista,...{anno:valueYears[0]}},page,rowsPerPage);
                                            /*
                                            setInfoPageListaCom({ page: 0, pageSize: 100 });
                                            setInfoPageToLocalStorageCommessa({ page: 0, pageSize: 100 });
                                            getListaCommesseOnAnnulla();
                                            setBodyDownload({idEnti:[],prodotto:'', anno:currentYear, mese:currString});
                                            setDataSelect([]);
                                            deleteFilterToLocalStorageCommessa();
                                            setValueAutocomplete([]);*/
                                        } }
                                        sx={{marginLeft:'24px'}} >
                    Annulla filtri
                                    </Button>
                                }
                            </div>
                        </div>
                    </div>

                    <div className="mt-5">
                        <div className="mt-1 mb-5" style={{ width: '100%'}}>
                            <GridCustom
                                nameParameterApi='uniqueId'
                                elements={dataGrid}
                                changePage={handleChangePage}
                                changeRow={handleChangeRowsPerPage} 
                                total={totalContestazioni}
                                page={page}
                                rows={rowsPerPage}
                                headerNames={['Ragione Sociale','Categoria Doc.', 'Stato','Mese','Anno','Data Inserimento','']}
                                apiGet={setIdContestazione}
                                disabled={getListaContestazioniRunning}
                                widthSize="1300px"></GridCustom>
                        </div>
                    </div>
                </div>
            </div>
            <ModalLoading 
                open={getListaContestazioniRunning} 
                setOpen={setGetListaContestazioniRunning} 
                sentence={'Loading...'}>
            </ModalLoading>
        </div>
      
    );
};

export default Storico;