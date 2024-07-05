import { Button, Typography } from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import { useState } from "react";
import {getProfilo, getToken } from "../reusableFunction/actionLocalStorage";
import ModalLoading from "../components/reusableComponents/modals/modalLoading";
import SelectUltimiDueAnni from "../components/reusableComponents/select/selectUltimiDueAnni";
import SelectMese from "../components/reusableComponents/select/selectMese";
import { BodyFatturazione,FattureObj} from "../types/typeFatturazione";
import { ElementMultiSelect, OptionMultiselectChackbox } from "../types/typeReportDettaglio";
import { DataGrid, GridColDef, GridEventListener, GridRowParams, MuiEvent } from "@mui/x-data-grid";
import { Params } from "../types/typesGeneral";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';


interface AccertamentiProps {
    dispatchMainState:any
}

const Accertamenti : React.FC<AccertamentiProps> = ({dispatchMainState}) =>{

    const token =  getToken();
    const profilo =  getProfilo();
    const currentYear = (new Date()).getFullYear();
    const currentMonth = (new Date()).getMonth() + 1;
    const monthNumber = Number(currentMonth);

    const [gridData, setGridData] = useState<any[]>([{
        id:1,
        tipologiaAccertamento:'Report fatturato / Prese in carico',
        anno:'2024',
        mese:'Gennaio'
    },
    {
        id:2,
        tipologiaAccertamento:'Report fatturato / Prese in carico con lotti',
        anno:'2024',
        mese:'Febbraio'
    },
    {
        id:3,
        tipologiaAccertamento:'Report contestato / Prese in carico',
        anno:'2024',
        mese:'Marzo'
    },
    {
        id:4,
        tipologiaAccertamento:'Report contestato / Prese in carico con lotti',
        anno:'2024',
        mese:'Gennaio'
    },
    {
        id:5,
        tipologiaAccertamento:'Report asseverazione / Prese in carico',
        anno:'2024',
        mese:'Febbraio'
    },
    {
        id:6,
        tipologiaAccertamento:'Report asseverazione / Prese in carico con lotti',
        anno:'2024',
        mese:'Marzo'
    }]);

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
  
    const [bodyFatturazione, setBodyFatturazione] = useState<BodyFatturazione>({
        anno:currentYear,
        mese:monthNumber,
        tipologiaFattura:[],
        idEnti:[]
    });
    const [bodyFatturazioneDownload, setBodyFatturazioneDownload] = useState<BodyFatturazione>({
        anno:currentYear,
        mese:monthNumber,
        tipologiaFattura:[],
        idEnti:[]
    });


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
        { field: 'tipologiaAccertamento', headerName: 'Tipologia Accertamento', width: 400 , headerClassName: 'super-app-theme--header', headerAlign: 'left',  renderCell: (param:any) => <a className="mese_alidita text-primary fw-bolder" href="/">{param.row.tipologiaAccertamento}</a>},
        { field: 'anno', headerName: 'Anno', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'mese', headerName: 'Mese', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        {field: 'action', headerName: '',sortable: false,width:70,headerAlign: 'left',disableColumnMenu :true,renderCell: (() => ( <DownloadIcon sx={{marginLeft:'10px',color: '#1976D2', cursor: 'pointer'}}></DownloadIcon>)),}
    ];


  

    return (
        <div className="mx-5 mb-5">
            <div className="marginTop24 ">
                <Typography variant="h4">Accertamenti</Typography>
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
                                    console.log('filtra');
                                } } 
                                sx={{ marginTop: 'auto', marginBottom: 'auto'}}
                                variant="contained"> Filtra
                            </Button>
                        </div>
                        <div className="col-2">
                            {statusAnnulla === 'hidden' ? null :
                                <Button
                                    onClick={()=>{
                                        console.log('annulla');
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

export default Accertamenti;