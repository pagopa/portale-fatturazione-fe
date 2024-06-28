import { Box, Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Typography } from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import { DataGrid, GridRowParams,GridEventListener,MuiEvent, GridColDef } from '@mui/x-data-grid';
import { useEffect, useState } from "react";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SelectUltimiDueAnni from "../components/reusableComponents/select/selectUltimiDueAnni";
import SelectMese from "../components/reusableComponents/select/selectMese";
import { getListaMessaggi, getMessaggiCount } from "../api/apiPagoPa/centroMessaggi/api";
import { getProfilo, getToken } from "../reusableFunction/actionLocalStorage";
import MultiSelectBase from "../components/reusableComponents/select/multiSelectBase";
import { MainState } from "../types/typesGeneral";


interface Messaggi {
    idEnte: null|string,
    idUtente: string,
    json: string,
    anno: number,
    mese: number,
    prodotto: string,
    gruppoRuolo: string,
    auth: string,
    stato: string,
    dataInserimento: string,
    dataStepCorrente: string,
    linkDocumento: string,
    tipologiaDocumento: string,
    lettura: boolean,
    hash: string
}

interface CentroMessaggiProps {
    mainState:MainState,
    dispatchMainState:any
}


const CentroMessaggi : React.FC<CentroMessaggiProps> = ({mainState,dispatchMainState}) => {

    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };

    const token = getToken();
    const profilo = getProfilo();
    const currentYear = (new Date()).getFullYear();
    const currentMonth = (new Date()).getMonth() + 1;
    const monthNumber = Number(currentMonth);
    
    const [bodyCentroMessaggi, setBodyCentroMessaggi] = useState({
        anno:currentYear,
        mese:null,
        tipologiaDocumento:[],
        letto: false
    });

    const [gridData, setGridData] = useState<Messaggi[]>([]);

    const [infoPageListaMes , setInfoPageListaMes] = useState({ page: 1, pageSize: 100 });


    console.log(gridData);

    const getMessaggi = async () =>{
        await getListaMessaggi(token,profilo.nonce,bodyCentroMessaggi,infoPageListaMes.page,infoPageListaMes.pageSize).then((res)=>{
           
            setGridData(res.data.messaggi);
        }).catch((err)=>{
            console.log(err);
        });
    };

    useEffect(()=>{
        getMessaggi();
    },[]);

    let columsSelectedGrid = '';
    const handleOnCellClick = (params) =>{
        columsSelectedGrid  = params.field;
    };

    const handleEvent: GridEventListener<'rowClick'> = (
        params:GridRowParams,
        event: MuiEvent<React.MouseEvent<HTMLElement>>,
    ) => {
        event.preventDefault();
        console.log(event);
    };

    const columns: GridColDef[] = [
        { field: 'anno', headerName: 'Anno Riferimento', width: 200 , headerClassName: 'super-app-theme--header', headerAlign: 'left'},
        { field: 'mese', headerName: 'Mese Riferimento', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'stato', headerName: 'Stato', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'dataInserimento', headerName: 'Data Inserimento', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left',valueFormatter: (value:any) =>  value.value !== null ? new Date(value.value).toLocaleString().split(',')[0] : '' },
        { field: 'lettura', headerName: 'Letto', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left'},
        {field: 'action', headerName: '',sortable: false,width:70,headerAlign: 'left',disableColumnMenu :true,renderCell: (() => ( <ArrowForwardIcon sx={{ color: '#1976D2', cursor: 'pointer' }} onClick={() => console.log('Show page details')} />)),}
    ];

    console.log(bodyCentroMessaggi);

    return (
        <div className="mx-5">
            <div className="marginTop24 ">
                <Typography variant="h4">Centro Messaggi</Typography>
            </div>
            <div className="mt-5">
                <div className="row">
                    <div className="col-3">
                        <SelectUltimiDueAnni values={bodyCentroMessaggi} setValue={setBodyCentroMessaggi}></SelectUltimiDueAnni>
                    </div>
                    <div  className="col-3">
                        <SelectMese values={bodyCentroMessaggi} setValue={setBodyCentroMessaggi}></SelectMese>
                    </div>
                    <div  className="col-3">
                        <MultiSelectBase
                            setBody={setBodyCentroMessaggi}
                            list={[]}
                            value={[]}
                            setValue={setBodyCentroMessaggi}
                            label={'Tipologia Documento'}
                            placeholder={"Tipologia Documento"}
                        ></MultiSelectBase>
                    </div>
                    <div  className="col-3">
                        <Box sx={{width:'80%', marginLeft:'20px'}}>
                            <FormControl fullWidth>
                                <InputLabel id="select lettura">Lettura</InputLabel>
                                <Select
                                    labelId="select-lettura"
                                    id="select-lettura"
                                    value={bodyCentroMessaggi.letto.toString()}
                                    label="Lettura"
                                    onChange={(e:SelectChangeEvent)=> {
                                        let val;
                                        if(e.target.value === 'true'){
                                            val = true;
                                        }else{
                                            val = false;
                                        }
                                        setBodyCentroMessaggi((prev)=>({...prev,...{letto:val}}));
                                    }}
                                >
                                    <MenuItem value={'true'}>Si</MenuItem>
                                    <MenuItem value={'false'}>No</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </div>
                </div>
                <div className="d-flex mt-5">
                   
                    <Button 
                        onClick={()=>{
                            getMessaggi();
                        } } 
                        sx={{ marginTop: 'auto', marginBottom: 'auto'}}
                        variant="contained"> Filtra
                    </Button>
                   
                    <Button
                        onClick={()=> setBodyCentroMessaggi({
                            anno:currentYear,
                            mese:null,
                            tipologiaDocumento:[],
                            letto: false
                        })}
                        sx={{marginLeft:'24px'}} >
                   Annulla filtri
                    </Button>
                    
                </div>
            </div>
            <div className="marginTop24" style={{display:'flex', justifyContent:'space-between', height:"48px"}}>
                
                {
                    [].length > 0 &&
                <Button onClick={() => console.log('grid')}
                    disabled={false}
                >
                Download Risultati
                    <DownloadIcon sx={{marginRight:'10px'}}></DownloadIcon>
                </Button>
                }
            </div>
            <div className="mt-1 mb-5" style={{ width: '100%'}}>
                <DataGrid sx={{
                    height:'400px',
                    '& .MuiDataGrid-virtualScroller': {
                        backgroundColor: 'white',
                    }
                }}
                onPaginationModelChange={(e)=>{console.log(e);}}
                paginationModel={infoPageListaMes}
                rows={gridData} 
                columns={columns}
                getRowId={(row) => row.idMessaggio}
                onRowClick={handleEvent}
                onCellClick={handleOnCellClick}
                />
            </div>
            <div>
             
            </div>
            
        </div>
    );

};

export default CentroMessaggi;