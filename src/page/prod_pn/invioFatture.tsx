import { useContext, useEffect, useState } from "react";

import IosShareIcon from '@mui/icons-material/IosShare';


import { Box } from "@mui/system";
import { InputLabel, Select, MenuItem, FormControl, Button, Toolbar, Typography} from "@mui/material";

import { DataGrid, GridCellParams, GridEventListener, GridRowParams, GridRowSelectionModel, MuiEvent } from "@mui/x-data-grid";
import { useNavigate } from "react-router";
import { manageError, managePresaInCarico } from "../../api/api";
import { getListaJsonFatturePagoPa, invioListaJsonFatturePagoPa } from "../../api/apiPagoPa/fatturazionePA/api";
import { configGridJsonSap } from "../../assets/configurations/config_GridInvioFattureJsonSap";
import ModalLoading from "../../components/reusableComponents/modals/modalLoading";
import NavigatorHeader from "../../components/reusableComponents/navigatorHeader";
import useSavedFiltersNested from "../../hooks/usaSaveFiltersLocalStorageNested";
import { GlobalContext } from "../../store/context/globalContext";
import { PathPf } from "../../types/enum";


interface ListaFatture {
    tipologiaFattura: string,
    statoInvio:number,
    numeroFatture: number,
    annoRiferimento: number,
    meseRiferimento: number,
    importo: number,
    id:string
}

export interface SelectedJsonSap {
    annoRiferimento: number,
    meseRiferimento: number,
    tipologiaFattura: string
}


const InvioFatture = () => {
    const globalContextObj = useContext(GlobalContext);
    const {mainState,dispatchMainState} = globalContextObj;
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;
    const navigate = useNavigate();
    
    const [listaFatture, setListaFatture] = useState<ListaFatture[]>([]);
    const [tipologieFatture, setTipologie] = useState<string[]>(['Tutte']);
    const [selected,setSelected] = useState<SelectedJsonSap[]>([]);
    const [tipologia, setTipologia] = useState('Tutte');
    const [showLoader, setShowLoader] = useState(false);
    const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>([]);
    const [infoPage , setInfoPage] = useState({ page: 0, pageSize: 10 });

    const { 
        filters,
        updateFilters,
        isInitialRender,
        resetFilters
    } = useSavedFiltersNested("/inviofatture",{});

    useEffect(()=>{
        if(isInitialRender.current && Object.keys(filters).length > 0){
            getLista(filters.tipologiaInvio);
        }else{
            getLista(tipologia);
            setSelected([]);
            setRowSelectionModel([]);
        }
    },[tipologia]);
    
    const getLista = async (tipologia) =>{
        await getListaJsonFatturePagoPa(token,profilo.nonce).then((res)=>{
            const array = res.data.map( el => el.tipologiaFattura);
            const uniqueArray = array.reduce((accumulator, current) => {
                if (!accumulator.includes(current)) {
                    accumulator.push(current);
                }
                return accumulator;
            }, []);
                
            setTipologie([...["Tutte"],...uniqueArray]);
            let elOrdered = res.data.map((el) => {
                return {
                    id:el.annoRiferimento+"-"+el.meseRiferimento+"-"+el.tipologiaFattura,
                    tipologiaFattura: el.tipologiaFattura,   
                    statoInvio: el.statoInvio,
                    numeroFatture: el.numeroFatture,
                    annoRiferimento: el.annoRiferimento,
                    meseRiferimento: el.meseRiferimento,
                    importo: el.importo.toLocaleString("de-DE", { style: "currency", currency: "EUR" })
                };
            }); 
            if(tipologia !== 'Tutte' ){
                elOrdered = elOrdered.filter(el => el.tipologiaFattura === tipologia);
            }
            setListaFatture(elOrdered);
        }).catch((err)=>{
            manageError(err, dispatchMainState);
        });
        if(isInitialRender.current && Object.keys(filters).length > 0){
            setTipologia(filters.tipologiaInvio);
            setSelected(filters.selectedInvio);
            setRowSelectionModel(filters.rowSelectionModelInvio);
            setInfoPage(filters.infoPageInvio);
        } 
    };

    const onButtonInvia = async() =>{
        setShowLoader(true);
        await invioListaJsonFatturePagoPa(token,profilo.nonce,selected).then(()=>{
            setShowLoader(false);
            getLista("Tutte");
            setSelected([]);
            setRowSelectionModel([]);
            setTipologia('Tutte');
            resetFilters();
            managePresaInCarico('SEND_JSON_SAP_OK',dispatchMainState);
        }).catch((err)=>{
            setShowLoader(false);
            setSelected([]);
            setRowSelectionModel([]);
            setTipologia('Tutte');
            resetFilters();
            manageError(err, dispatchMainState);
        });
    };

    const statoFattura = (row) =>{
        let tooltipObj:any= {label:'...',title:'...'};
        if(row.statoInvio === 0){
            tooltipObj = {label:'Da inviare',title:'Da inviare',color:'info'};
        }else if(row.statoInvio === 2){
            tooltipObj = {label:'Elaborazione',title:'La fattura è in elaborazione',color:'warning'};
        }
        return tooltipObj;
    };


    let columsSelectedGrid = '';
    const handleOnCellClick = (params: GridCellParams) =>{
        columsSelectedGrid  = params.field;
    };
    
    const handleEvent: GridEventListener<'rowClick'> = (
        params:GridRowParams,
        event: MuiEvent<React.MouseEvent<HTMLElement>>,
    ) => {
        event.preventDefault();
        if(columsSelectedGrid  === 'tipologiaFattura' || columsSelectedGrid === 'action' ){
            navigate(PathPf.JSON_TO_SAP_DETAILS.replace(":id",params.row.id));
        }
    };

    const onChangePageOrRowGrid = (e) => {
        setInfoPage(e);
    };

    return(
        <>
            <div>
                <NavigatorHeader pageFrom={"Documenti emessi/"} pageIn={"Inserimento fatture"} backPath={PathPf.FATTURAZIONE} icon={<IosShareIcon sx={{paddingBottom:"5px"}}  fontSize='small'></IosShareIcon>}></NavigatorHeader>
            </div>
            <div className="mx-5 mb-5">
                <div className="mt-5">
                    <div className="row">
                        <div className="col-3">
                            <Box>
                                <FormControl fullWidth size="medium">
                                    <InputLabel> Tipologia Fattura</InputLabel>
                                    <Select label='Tipologia Fattura' onChange={(e) => {
                                        setTipologia(e.target.value);
                                        updateFilters({
                                            pathPage:"/inviofatture",
                                            tipologiaInvio:e.target.value,
                                            selectedInvio:selected,
                                            rowSelectionModelInvio:rowSelectionModel,
                                            infoPageInvio:infoPage
                                        });
                                    } }
                                    value={tipologia||''}>
                                        {tipologieFatture.map((el) =>{ 
                                            return (            
                                                <MenuItem key={Math.random()} value={el}>
                                                    {el}
                                                </MenuItem>              
                                            );
                                        } )}
                                    </Select>
                                </FormControl>
                            </Box>   
                        </div>
                        <div className="col-2 text-center">
                            <div className="d-flex justify-content-center align-items-center" style={{height:'59px'}}>
                                <Button variant='outlined'disabled={selected?.length < 1} onClick={onButtonInvia}>
                                    Invia
                                </Button>
                            </div>
                        </div>
                        <div className="row mt-5">
                            <div className="col-12">
                                { selected?.length > 0 ? 
                                    <Toolbar sx={{bgcolor:"rgba(23, 50, 77, 0.08)"}}>
                                        <Typography sx={{ flex: '1 1 100%' }} color="inherit" variant="subtitle1"component="div">
                                            {`${selected?.length}  Selezionate`} 
                                        </Typography>
                                    </Toolbar>
                                    :
                                    <Typography sx={{ flex: '1 1 100%', visibility: 'hidden', height:'64px' }} variant="subtitle1" component="div">
                                        Placeholder
                                    </Typography>
                                }
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-12">
                                <div className="mt-1 mb-5" style={{ width: '100%'}}> 
                                    <DataGrid
                                        sx={{
                                            height:'400px',
                                            '& .MuiDataGrid-virtualScroller': {
                                                backgroundColor: 'white',
                                            },
                                            "& .MuiDataGrid-row": {
                                                borderTop: "4px solid #F2F2F2",
                                                borderBottom: "2px solid #F2F2F2",
                                            }
                                        }}
                                        rowHeight={60}
                                        getRowId={(row) => row.id}
                                        rows={listaFatture}
                                        columns={configGridJsonSap(statoFattura)}
                                        pageSizeOptions={[10, 25, 50,100]}
                                        checkboxSelection
                                        isRowSelectable={(params) => {
                                            if(params.row.statoInvio === 2){
                                                return params.row.disableCheckbox;
                                            }else{
                                                return !params.row.statoInvio;
                                            }
                                        }}
                                        onRowClick={handleEvent}
                                        onCellClick={handleOnCellClick}
                                        rowSelectionModel={rowSelectionModel}
                                        onRowSelectionModelChange={(newRowSelectionModel) => {
                                            const createObjectToSend = newRowSelectionModel.reduce((acc:any,singleEl) => {
                                                const getElementWithSameId = listaFatture.filter((el:ListaFatture) => el?.id === singleEl);  
                                                return [...acc,...getElementWithSameId];
                                            },[]).map(el => ({
                                                annoRiferimento: el.annoRiferimento,
                                                meseRiferimento: el.meseRiferimento,
                                                tipologiaFattura: el.tipologiaFattura
                                            }));
                                            setRowSelectionModel(newRowSelectionModel);
                                            setSelected(createObjectToSend);
                                            updateFilters({
                                                pathPage:"/inviofatture",
                                                tipologiaInvio:tipologia,
                                                selectedInvio:createObjectToSend,
                                                rowSelectionModelInvio:newRowSelectionModel,
                                                infoPageInvio:infoPage
                                            });
                                        }}
                                        paginationModel={infoPage}
                                        onPaginationModelChange={(e)=> onChangePageOrRowGrid(e)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ModalLoading 
                open={showLoader} 
                setOpen={setShowLoader}
                sentence={'Loading...'} >
            </ModalLoading>
        </>
    );
};
export default InvioFatture;
