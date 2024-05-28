import { Button, Typography } from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import { DataGrid, GridColDef, GridEventListener, GridRowParams, MuiEvent } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { getToken } from "../reusableFunction/actionLocalStorage";
import ModalLoading from "../components/reusableComponents/modals/modalLoading";
import { Params } from "../types/typesGeneral";
import SelectUltimiDueAnni from "../components/reusableComponents/selectUltimiDueAnni";
import SelectMese from "../components/reusableComponents/selectMese";
import SelectTipologiaFattura from "../components/reusableComponents/selectTipologiaFattura";
import { BodyFatturazione, FatturazioneProps } from "../types/typeFatturazione";
import { getFatturazionePagoPa } from "../api/apiPagoPa/fatturazionePA/api";
import { manageError } from "../api/api";

const Fatturazione : React.FC<FatturazioneProps> = ({mainState, dispatchMainState}) =>{

    const token =  getToken();

    const currentYear = (new Date()).getFullYear();
    const currentMonth = (new Date()).getMonth() + 1;
    const month = Number(currentMonth);


    const [gridData, setGridData] = useState([]);
    const [infoPageBando , setInfoPageBando] = useState({ page: 0, pageSize: 100 });
    const [showLoadingGrid,setShowLoadingGrid] = useState(false);
    const [showDownloading,setShowDownloading] = useState(false);
    const [getListaFatturazione, setGetListaFatturazioneRunning] = useState(false);
    const [bodyFatturazione, setBodyFatturazione] = useState<BodyFatturazione>({
        anno:2024,
        mese:2,
        tipologiaFattura:''
    });

    useEffect(()=>{
        getlistaFatturazione();
    },[mainState.nonce]);


  

    const getlistaFatturazione = async () => {
        setGetListaFatturazioneRunning(true);
       
        await  getFatturazionePagoPa(token,mainState.nonce,bodyFatturazione)
            .then((res)=>{
                // ordino i dati in base all'header della grid
                /* const orderDataCustom = res.data.relTestate.map((obj)=>{
                    // inserire come prima chiave l'id se non si vuol renderlo visibile nella grid
                    // 'id serve per la chiamata get dettaglio dell'elemento selezionato nella grid
                    return {
                        idTestata:obj.idTestata,
                        ragioneSociale:obj.ragioneSociale,
                        tipologiaFattura:obj.tipologiaFattura,
                        firmata:obj.firmata,
                        idContratto:obj.idContratto,
                        anno:obj.anno,
                        mese:mesiGrid[obj.mese],
                        totaleAnalogico:obj.totaleAnalogico.toLocaleString("de-DE", { style: "currency", currency: "EUR" }),
                        totaleDigitale:obj.totaleDigitale.toLocaleString("de-DE", { style: "currency", currency: "EUR" }),
                        totaleNotificheAnalogiche:obj.totaleNotificheAnalogiche,
                        totaleNotificheDigitali:obj.totaleNotificheDigitali,
                        totale:obj.totale.toLocaleString("de-DE", { style: "currency", currency: "EUR" })
                    };
                });*/
                setGridData(res.data);
                setGetListaFatturazioneRunning(false);
            }).catch((error)=>{
                if(error?.response?.status === 404){
                    setGridData([]);
                }
                setGetListaFatturazioneRunning(false);
                manageError(error, dispatchMainState);
            });
                  
    };


    const columns: GridColDef[] = [
        { field: 'ragioneSociale', headerName: 'Ragione Sociale', width: 200 , headerClassName: 'super-app-theme--header', headerAlign: 'left',  renderCell: (param:any) => <a className="mese_alidita text-primary fw-bolder" >{param.row.ragioneSociale}</a>},
        { field: 'prodotto', headerName: 'Prodotto', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'tipoContratto', headerName: 'Tipo Contratto', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'dataAnagrafica', headerName: 'Data Ultima Modifica Anagrafica', width: 200, headerClassName: 'super-app-theme--header', headerAlign: 'left',valueFormatter: (value:any) =>  value.value !== null ? new Date(value.value).toLocaleString().split(',')[0] : ''},
        { field: 'calcoloAsseverazione', headerName: 'Calcolo Asseverazione', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'dataAsseverazione', headerName: 'Data Adesione al Bando', width: 200, headerClassName: 'super-app-theme--header', headerAlign: 'left', valueFormatter: (value:any) =>  value.value !== null ? new Date(value.value).toLocaleString().split(',')[0] : ''},
        { field: 'descrizione', headerName: 'Descrizione Bando', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'asseverazione', headerName: 'Adesione al Bando', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        // { field: 'tipoCalcoloAsseverazione', headerName: 'Tipo Calcolo Asseverazione', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        //{ field: 'idUtente', headerName: 'Id Utente', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        // {field: 'action', headerName: '',sortable: false,width:70,headerAlign: 'left',disableColumnMenu :true,renderCell: (() => ( <ArrowForwardIcon sx={{ color: '#1976D2', cursor: 'pointer' }} onClick={() => console.log('Show page details')} />)),}
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
                    <div  className="col-3">
                        <SelectTipologiaFattura values={bodyFatturazione} setValue={setBodyFatturazione}></SelectTipologiaFattura>
                    </div>
                </div>
            </div>
            <div className="marginTop24" style={{display:'flex', justifyContent:'end', height:"48px"}}>
                
                {
                    [''].length > 0 &&
                <Button onClick={() => console.log('download')}
                    disabled={false}
                >
                Download Risultati
                    <DownloadIcon sx={{marginRight:'10px'}}></DownloadIcon>
                </Button>
                }
            </div>
            <div className="mt-1 mb-5" style={{ width: '100%'}}>
                <DataGrid sx={{
                    height:'500px',
                    '& .MuiDataGrid-virtualScroller': {
                        backgroundColor: 'white',
                    }
                }}
                onPaginationModelChange={(e)=>{
                    setInfoPageBando(e);}}
                paginationModel={infoPageBando}
                rows={gridData} 
                columns={columns}
                getRowId={(row) => row.idEnte}
                onRowClick={handleEvent}
                onCellClick={handleOnCellClick}
                />
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