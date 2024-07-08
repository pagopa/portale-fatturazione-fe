import { Button, Typography } from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import { useEffect, useState } from "react";
import {getProfilo, getToken } from "../reusableFunction/actionLocalStorage";
import ModalLoading from "../components/reusableComponents/modals/modalLoading";
import SelectUltimiDueAnni from "../components/reusableComponents/select/selectUltimiDueAnni";
import SelectMese from "../components/reusableComponents/select/selectMese";
import { BodyFatturazione,FattureObj} from "../types/typeFatturazione";
import { ElementMultiSelect, OptionMultiselectChackbox } from "../types/typeReportDettaglio";
import { DataGrid, GridColDef, GridEventListener, GridRowParams, MuiEvent } from "@mui/x-data-grid";
import { Params } from "../types/typesGeneral";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { getDownloadSingleAccertamentoPagoPa, getListaAccertamentiPagoPa } from "../api/apiPagoPa/accertamentiPA/api";
import { manageError } from "../api/api";
import { Accertamento, BodyAccertamenti } from "../types/typeAccertamenti";
import { mesiGrid } from "../reusableFunction/reusableArrayObj";


interface AccertamentiProps {
    dispatchMainState:any
}

const Accertamenti : React.FC<AccertamentiProps> = ({dispatchMainState}) =>{

    const token =  getToken();
    const profilo =  getProfilo();
    const currentYear = (new Date()).getFullYear();
    const currentMonth = (new Date()).getMonth() + 1;
    const monthNumber = Number(currentMonth);

    const [gridData, setGridData] = useState<Accertamento[]>([]);

    const [infoPageAccertamenti , setInfoPageAccertamenti] = useState({ page: 0, pageSize: 100 });
    const [showLoadingGrid,setShowLoadingGrid] = useState(false);
    const [showDownloading,setShowDownloading] = useState(false);
    const [dataSelect, setDataSelect] = useState<ElementMultiSelect[]>([]);
    const [textValue, setTextValue] = useState('');
    const [valueAutocomplete, setValueAutocomplete] = useState<OptionMultiselectChackbox[]>([]);
    const [statusAnnulla, setStatusAnnulla] = useState<string>('hidden');
    const [tipologie, setTipologie] = useState<string[]>([]);
    const [valueMulitselectTipologie, setValueMultiselectTipologie] = useState<string[]>([]);
    const [showedData, setShowedData] = useState<FattureObj[]>([]);
  
    const [bodyAccertamenti, setBodyAccertamenti] = useState<BodyAccertamenti>({
        anno:currentYear,
        mese:null,
        tipologiaFattura:[],
        idEnti:[]
    });
    const [bodyAccertamentiDownload, setBodyAccertamentiDownload] = useState<BodyAccertamenti>({
        anno:currentYear,
        mese:null,
        tipologiaFattura:[],
        idEnti:[]
    });

    useEffect(()=>{

        getListaAccertamenti(new Date().getFullYear(),null);
    },[]);


    const getListaAccertamenti = async(anno,mese) => {

        await getListaAccertamentiPagoPa(token, profilo.nonce, {anno,mese} )
            .then((res)=>{
                setGridData(res.data);
            })
            .catch(((err)=>{
                manageError(err,dispatchMainState);
         
            }));

    };

    const downloadAccertamento = async (id,mese,anno) => {
        setShowDownloading(true);
        await getDownloadSingleAccertamentoPagoPa(token,profilo.nonce, {idReport:id}).then((res)=>{
            const blob = new Blob([res.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.setAttribute('hidden', '');
            a.setAttribute('href', url);
            a.setAttribute('download',`Accertamento/${mese}/${anno}.csv`);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);   
            setShowDownloading(false);
        }).catch(((err)=>{
            setShowDownloading(false);
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
     
    };

    const columns: GridColDef[] = [
        { field: 'descrizione', headerName: 'Tipologia Accertamento', width: 400 , headerClassName: 'super-app-theme--header', headerAlign: 'left',  renderCell: (param:any) => <a className="mese_alidita text-primary fw-bolder" href="/">{param.row.descrizione}</a>},
        { field: 'prodotto', headerName: 'Prodotto', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'anno', headerName: 'Anno', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'mese', headerName: 'Mese', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' ,renderCell: (param:any) => <div className="MuiDataGrid-cellContent" title={mesiGrid[param.row.mese]} role="presentation">{mesiGrid[param.row.mese]}</div> },
        {field: 'action', headerName: '',sortable: false,width:70,headerAlign: 'left',disableColumnMenu :true,renderCell: ((param:any) => ( <DownloadIcon sx={{marginLeft:'10px',color: '#1976D2', cursor: 'pointer'}} onClick={()=> downloadAccertamento(param.id,param.row.mese,param.row.anno)}></DownloadIcon>)),}
    ];


  

    return (
        <div className="mx-5 mb-5">
            <div className="marginTop24 ">
                <Typography variant="h4">Accertamenti</Typography>
            </div>
            <div className="mt-5">
                <div className="row">
                    <div className="col-3">
                        <SelectUltimiDueAnni values ={bodyAccertamenti} setValue={setBodyAccertamenti}></SelectUltimiDueAnni>
                    </div>
                    <div  className="col-3">
                        <SelectMese values={bodyAccertamenti} setValue={setBodyAccertamenti}></SelectMese>
                    </div>
                    {/* 
                    <div  className="col-3">
                        <MultiSelectBase
                            setBody={setBodyFatturazione}
                            list={tipologie}
                            value={valueMulitselectTipologie}
                            setValue={setValueMultiselectTipologie}
                            label={'Tipologia Fattura'}
                            placeholder={"Tipologia Fattura"}
                        ></MultiSelectBase>
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
                    */}
                </div>
                <div className=" mt-5">
                    <div className="row">
                        <div className="col-1">
                            <Button 
                                onClick={()=>{
                                    getListaAccertamenti(bodyAccertamenti.anno, bodyAccertamenti.mese);
                                } } 
                                sx={{ marginTop: 'auto', marginBottom: 'auto'}}
                                variant="contained"> Filtra
                            </Button>
                        </div>
                        <div className="col-2">
                            {bodyAccertamenti.mese === null ? null :
                                <Button
                                    onClick={()=>{
                                        getListaAccertamenti(new Date().getFullYear(),null);
                                        setBodyAccertamenti({
                                            anno:currentYear,
                                            mese:null,
                                            tipologiaFattura:[],
                                            idEnti:[]
                                        });
                                    } }
                                    sx={{marginLeft:'24px'}} >
                              Annulla filtri
                                </Button>
                            }
                        </div>
                       
                        
                    </div>
                </div>
                   
            </div>
            
            
            <div className="mt-5 mb-5" style={{ width: '100%'}}>
                <DataGrid sx={{
                    height:'400px',
                    '& .MuiDataGrid-virtualScroller': {
                        backgroundColor: 'white',
                    }
                }}
                onPaginationModelChange={(e)=>{
                    setInfoPageAccertamenti(e);}}
                paginationModel={infoPageAccertamenti}
                rows={gridData} 
                columns={columns}
                getRowId={(row) => row.idReport}
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

export default Accertamenti;