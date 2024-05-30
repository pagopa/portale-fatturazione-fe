import { Button, Typography } from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import { DataGrid, GridColDef, GridEventListener, GridRowParams, MuiEvent } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { getProfilo, getToken } from "../reusableFunction/actionLocalStorage";
import ModalLoading from "../components/reusableComponents/modals/modalLoading";
import { Params } from "../types/typesGeneral";
import SelectUltimiDueAnni from "../components/reusableComponents/selectUltimiDueAnni";
import SelectMese from "../components/reusableComponents/selectMese";
import { BodyFatturazione, FatturazioneProps } from "../types/typeFatturazione";
import { getFatturazionePagoPa, getTipologieFaPagoPa } from "../api/apiPagoPa/fatturazionePA/api";
import { manageError } from "../api/api";
import MultiselectCheckbox from "../components/reportDettaglio/multiSelectCheckbox";
import { ElementMultiSelect, OptionMultiselectChackbox } from "../types/typeReportDettaglio";
import { listaEntiNotifichePage } from "../api/apiSelfcare/notificheSE/api";
import MultiSelectFatturazione from "../components/fatturazione/multiSelect";
import CollapsibleTable from "../components/reusableComponents/gridCustomCollapsible";

const Fatturazione : React.FC<FatturazioneProps> = ({mainState, dispatchMainState}) =>{

    const token =  getToken();
    const profilo =  getProfilo();

    const currentYear = (new Date()).getFullYear();
    const currentMonth = (new Date()).getMonth() + 1;
    const month = Number(currentMonth);

    const [gridData, setGridData] = useState([]);
    const [infoPageFatturazione , setInfoPageFatturazione] = useState({ page: 0, pageSize: 100 });
    const [showLoadingGrid,setShowLoadingGrid] = useState(false);
    const [showDownloading,setShowDownloading] = useState(false);
    const [dataSelect, setDataSelect] = useState<ElementMultiSelect[]>([]);
    const [textValue, setTextValue] = useState('');
    const [valueAutocomplete, setValueAutocomplete] = useState<OptionMultiselectChackbox[]>([]);
    const [statusAnnulla, setStatusAnnulla] = useState('hidden');
    const [tipologie, setTipologie] = useState<string[]>([]);
    const [valueMulitselectTipologie, setValueMultiselectTipologie] = useState<string[]>([]);
  
    const [bodyFatturazione, setBodyFatturazione] = useState<BodyFatturazione>({
        anno:currentYear,
        mese:month,
        tipologiaFattura:[],
        idEnti:[]
    });
    
    useEffect(()=>{
        if(mainState.nonce !== ''){
            getlistaFatturazione(bodyFatturazione);
        }
    },[mainState.nonce]);

    useEffect(()=>{
        if(bodyFatturazione.idEnti.length !== 0 || bodyFatturazione.tipologiaFattura.length !== 0 ){
            setStatusAnnulla('show');
        }else{
            setStatusAnnulla('hidden');
        }
    },[bodyFatturazione]);

    useEffect(()=>{
        if(dataSelect.length === 0){
            setValueAutocomplete([]);
        }
    }, [dataSelect]);
   
    useEffect(()=>{
        const timer = setTimeout(() => {
            if(textValue.length >= 3){
                listaEntiNotifichePageOnSelect();
            }
        }, 800);
        return () => clearTimeout(timer);
    },[textValue]);

   
    useEffect(()=>{
        if(mainState.nonce !== ''){
            getTipologieFatturazione();
            setValueMultiselectTipologie([]);
        }
    },[mainState.nonce, bodyFatturazione.mese,bodyFatturazione.anno]);

    const getTipologieFatturazione =  async() => {
        await getTipologieFaPagoPa(token, mainState.nonce, {anno:bodyFatturazione.anno,mese:bodyFatturazione.mese}  )
            .then((res)=>{
                setTipologie(res.data);                
            })
            .catch(((err)=>{
                manageError(err,dispatchMainState);
            }));
    };
    

  

    const getlistaFatturazione = async (body) => {
        setShowLoadingGrid(true);

        await  getFatturazionePagoPa(token,mainState.nonce,body)
            .then((res)=>{
                const orderDataCustom = res.data.map(el => el.fattura).map(obj=> ({...{id:Math.random()},...obj}));
                setGridData(orderDataCustom);
                setShowLoadingGrid(false);
            }).catch((error)=>{
                if(error?.response?.status === 404){
                    setGridData([]);
                }
                setShowLoadingGrid(false);
                manageError(error, dispatchMainState);
            });        
    };

    // servizio che popola la select con la checkbox
    const listaEntiNotifichePageOnSelect = async () =>{
        if(profilo.auth === 'PAGOPA'){
            await listaEntiNotifichePage(token, mainState.nonce, {descrizione:textValue} )
                .then((res)=>{
                    setDataSelect(res.data);
                })
                .catch(((err)=>{
                    manageError(err,dispatchMainState);
                }));
        }
    };

  


    const columns: GridColDef[] = [
        { field: 'ragionesociale', headerName: 'Ragione Sociale', width: 200 , headerClassName: 'super-app-theme--header', headerAlign: 'left',  renderCell: (param:any) => <a className="mese_alidita text-primary fw-bolder" >{param.row.ragionesociale}</a>},
        { field: 'tipocontratto', headerName: 'Tipo Contratto', width: 140 , headerClassName: 'super-app-theme--header', headerAlign: 'left'},
        { field: 'totale', headerName: 'Tot.', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left',  valueFormatter: ({ value }) => value.toLocaleString("de-DE", { style: "currency", currency: "EUR" })},
        { field: 'numero', headerName: 'N. Fattura', width: 120 , headerClassName: 'super-app-theme--header', headerAlign: 'left'},
        { field: 'tipoDocumento', headerName: 'Tipo Documento', width: 140, headerClassName: 'super-app-theme--header', headerAlign: 'left'},
        { field: 'divisa', headerName: 'Divisa', width: 120, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'metodoPagamento', headerName: 'M. Pagamento', width: 140 , headerClassName: 'super-app-theme--header', headerAlign: 'left'},
        { field: 'identificativo', headerName: 'Ident.', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'tipologiaFattura', headerName: 'T. Fattura', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'split', headerName: 'Split', width: 140, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'dataFattura', headerName: 'Data Fattura', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left',valueFormatter: (value:any) =>  value.value !== null ? new Date(value.value).toLocaleString().split(',')[0] : '' },
    ];

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
      
    };

    return (
        <div className="mx-5">
            <div className="marginTop24 ">
                <Typography variant="h4">Fatturazione</Typography>
            </div>
            <div className="mt-5">
                <div className="row">
                    <div className="col-3">
                        <SelectUltimiDueAnni values ={bodyFatturazione} setValue={setBodyFatturazione}></SelectUltimiDueAnni>
                    </div>
                    <div  className="col-3">
                        <SelectMese values={bodyFatturazione} setValue={setBodyFatturazione}></SelectMese>
                    </div>
                    {/* 
                    <div  className="col-3">
                        <SelectTipologiaFattura values={bodyFatturazione} setValue={setBodyFatturazione}  types={tipologie}></SelectTipologiaFattura>
                    </div>*/}
                    <div  className="col-3">
                        <MultiSelectFatturazione
                            setBody={setBodyFatturazione}
                            list={tipologie}
                            value={valueMulitselectTipologie}
                            setValue={setValueMultiselectTipologie}
                        ></MultiSelectFatturazione>
                    </div>
                    <div  className="col-3">
                        <MultiselectCheckbox 
                            setBodyGetLista={setBodyFatturazione}
                            dataSelect={dataSelect}
                            setTextValue={setTextValue}
                            valueAutocomplete={valueAutocomplete}
                            setValueAutocomplete={setValueAutocomplete}
                        ></MultiselectCheckbox>
                    </div>
                </div>
                <div className="d-flex mt-5">
                   
                    <Button 
                        onClick={()=>{
                            setInfoPageFatturazione({ page: 0, pageSize: 100 });
                            getlistaFatturazione(bodyFatturazione);
                            //setBodyDownload(bodyGetLista);
                        } } 
                        sx={{ marginTop: 'auto', marginBottom: 'auto'}}
                        variant="contained"> Filtra
                    </Button>
                    {statusAnnulla === 'hidden' ? null :
                        <Button
                            onClick={()=>{
                                setInfoPageFatturazione({ page: 0, pageSize: 100 });
                                getlistaFatturazione({
                                    anno:currentYear,
                                    mese:month,
                                    tipologiaFattura:[],
                                    idEnti:[]
                                });
                                setBodyFatturazione({
                                    anno:currentYear,
                                    mese:month,
                                    tipologiaFattura:[],
                                    idEnti:[]
                                });
                                setDataSelect([]);
                                setValueMultiselectTipologie([]);
                             
                            } }
                            sx={{marginLeft:'24px'}} >
                    Annulla filtri
                        </Button>
                    }
                </div>
            </div>
            <div className="marginTop24" style={{display:'flex', justifyContent:'end', height:"48px"}}>
                
                {
                    gridData.length > 0 &&
                <Button onClick={() => console.log('download')}
                    disabled={false}
                >
                Download Risultati
                    <DownloadIcon sx={{marginRight:'10px'}}></DownloadIcon>
                </Button>
                }
            </div>
            <div className="">
                <CollapsibleTable data={gridData}></CollapsibleTable>
            </div>
            <div>
                <ModalLoading 
                    open={showLoadingGrid} 
                    setOpen={setShowLoadingGrid}
                    sentence={'Loading...'} >
                </ModalLoading>
                <ModalLoading 
                    open={showDownloading} 
                    setOpen={setShowDownloading}
                    sentence={'Downloading...'} >
                </ModalLoading>
            </div>
            
        </div>
    );
};

export default Fatturazione;