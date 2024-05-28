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
import MultiselectCheckbox from "../components/reportDettaglio/multiSelectCheckbox";
import { ElementMultiSelect, OptionMultiselectChackbox } from "../types/typeReportDettaglio";

const Fatturazione : React.FC<FatturazioneProps> = ({mainState, dispatchMainState}) =>{

    const token =  getToken();

    const currentYear = (new Date()).getFullYear();
    const currentMonth = (new Date()).getMonth() + 1;
    const month = Number(currentMonth);

    const tipologie = [
        'ACCONTO',
        'ANTICIPO',
        'PRIMO CONGUA',
        'PRIMO SALDO',
        'SECONDO CONGUA',
        'SECONDO SALDO'];


    const [gridData, setGridData] = useState([]);
    const [infoPageFatturazione , setInfoPageFatturazione] = useState({ page: 0, pageSize: 100 });
    const [showLoadingGrid,setShowLoadingGrid] = useState(false);
    const [showDownloading,setShowDownloading] = useState(false);
    const [dataSelect, setDataSelect] = useState<ElementMultiSelect[]>([]);
    const [textValue, setTextValue] = useState('');
    const [valueAutocomplete, setValueAutocomplete] = useState<OptionMultiselectChackbox[]>([]);
    const [statusAnnulla, setStatusAnnulla] = useState('hidden');
    const [bodyFatturazione, setBodyFatturazione] = useState<BodyFatturazione>({
        anno:currentYear,
        mese:month,
        tipologiaFattura:tipologie[0],
        idEnti:[]
    });

    useEffect(()=>{
        if(mainState.nonce !== ''){
            getlistaFatturazione(bodyFatturazione);
        }
    },[mainState.nonce]);

    useEffect(()=>{
        if(bodyFatturazione?.idEnti.length !== 0 ){
            setStatusAnnulla('show');
        }else{
            setStatusAnnulla('hidden');
        }
    },[bodyFatturazione]);


  

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


    const columns: GridColDef[] = [
        { field: 'ragionesociale', headerName: 'Ragione Sociale', width: 200 , headerClassName: 'super-app-theme--header', headerAlign: 'left',  renderCell: (param:any) => <a className="mese_alidita text-primary fw-bolder" >{param.row.ragionesociale}</a>},
        { field: 'tipocontratto', headerName: 'Tipo Contratto', width: 140 , headerClassName: 'super-app-theme--header', headerAlign: 'left'},
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
                    <div  className="col-3">
                        <SelectTipologiaFattura values={bodyFatturazione} setValue={setBodyFatturazione}  types={tipologie}></SelectTipologiaFattura>
                    </div>
                    <div  className="col-3">
                        <MultiselectCheckbox 
                            mainState={mainState} 
                            dispatchMainState={dispatchMainState}
                            setBodyGetLista={setBodyFatturazione}
                            setDataSelect={setDataSelect}
                            dataSelect={dataSelect}
                            setTextValue={setTextValue}
                            textValue={textValue}
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
                                    tipologiaFattura:tipologie[0],
                                    idEnti:[]
                                });
                                setBodyFatturazione({
                                    anno:currentYear,
                                    mese:month,
                                    tipologiaFattura:tipologie[0],
                                    idEnti:[]
                                });
                                setDataSelect([]);
                             
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
            <div className="mt-1 mb-5" style={{ width: '100%'}}>
                <DataGrid sx={{
                    height:'500px',
                    '& .MuiDataGrid-virtualScroller': {
                        backgroundColor: 'white',
                    }
                }}
                onPaginationModelChange={(e)=>{
                    setInfoPageFatturazione(e);}}
                paginationModel={infoPageFatturazione}
                rows={gridData} 
                columns={columns}
                getRowId={(row) => row.id}
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