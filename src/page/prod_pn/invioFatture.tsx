import { useEffect, useRef, useState } from "react";
import { GridCellParams, GridEventListener, GridRowParams, GridRowSelectionModel, MuiEvent } from "@mui/x-data-grid";
import { useNavigate } from "react-router";
import { manageError, manageErrorDownload, managePresaInCarico } from "../../api/api";
import { downloadReportRelNonFatturate, getListaJsonFatturePagoPa, invioListaJsonFatturePagoPa, sendListaJsonFatturePagoPa } from "../../api/apiPagoPa/fatturazionePA/api";
import ModalLoading from "../../components/reusableComponents/modals/modalLoading";
import useSavedFiltersNested from "../../hooks/usaSaveFiltersLocalStorageNested";
import { PathPf } from "../../types/enum";
import { useGlobalStore } from "../../store/context/useGlobalStore";
import { ActionTopGrid, FilterActionButtons, MainBoxStyled, RenderIcon, ResponsiveGridContainer } from "../../components/reusableComponents/layout/mainComponent";
import { saveAs } from "file-saver";
import MainFilter from "../../components/reusableComponents/mainFilter";
import GridCustom from "../../components/reusableComponents/grid/gridCustom";
import { headerNamesInvioFatture, headerNamesInvioFattureCollapse } from "../../assets/configurations/conf_GridInvioFatture";


interface ListaFatture {
  tipologiaFattura: string,
  statoInvio:number,
  numeroFatture: number,
  annoRiferimento: number,
  meseRiferimento: number,
  importo: number,
  fatture:any[]
}

export interface SelectedJsonSap {
  annoRiferimento: number,
  meseRiferimento: number,
  tipologiaFattura: string,
  idFattura:number|null
}


const InvioFatture : React.FC = () => {

  const mainState = useGlobalStore(state => state.mainState);
  const dispatchMainState = useGlobalStore(state => state.dispatchMainState);

  const token =  mainState.profilo.jwt;
  const profilo =  mainState.profilo;
  const navigate = useNavigate();

  const callLista = useRef(true);
    
  const [listaFatture, setListaFatture] = useState<ListaFatture[]>([]);
  const [tipologieFatture, setTipologie] = useState<string[]>(['Tutte']);
  const [selected,setSelected] = useState<SelectedJsonSap[]>([]);
  const [tipologia, setTipologia] = useState('Tutte');
  const [showLoader, setShowLoader] = useState(false);
  const [showDownloading, setShowDownloading] = useState(false);
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>([]);
  const [infoPage , setInfoPage] = useState({ page: 0, pageSize: 10 });


  const [collapseDataLoading,setCollapseDataLoading] = useState(true);


  const [bodyFatturazione, setBodyFatturazione] = useState<Record<string, unknown>>({
    anno:"",
    mese:"",
    tipologiaFattura:[],
    inviata:3
  });

  const [arrayYears,setArrayYears] = useState<number[]>([]);
  const [arrayMonths,setArrayMonths] = useState<{mese:string,descrizione:string}[]>([]);

  const [valueMulitselectTipologie, setValueMultiselectTipologie] = useState<string[]>([]);

   

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

      const addMockInviate = [
        {
          "tipologiaFattura": "PRIMO SALDO",
          "numeroFatture": 1,
          "annoRiferimento": 2022,
          "meseRiferimento": 12,
          "importo": 11,
          "statoInvio": 3,
          "fatture":[
            {
              "idFattura": 1111,
              "tipologiaFattura": "PRIMO SALDO",
              "idEnte": "d7d441ea-dbd5-4c49-bb5f-12821558c6fe",
              "ragioneSociale": "Regione Lombardia",
              "annoRiferimento": 2022,
              "meseRiferimento": 12,
              "importo": 11,
              "dataFattura": "2025-02-10T00:00:00"
            }
          ]
        },
        {
          "tipologiaFattura": "SECONDO SALDO",
          "numeroFatture": 1,
          "annoRiferimento": 2022,
          "meseRiferimento": 12,
          "importo": 100,
          "statoInvio": 3,
          "fatture":[
            {
              "idFattura": 22222,
              "tipologiaFattura": "SECONDO SALDO",
              "idEnte": "d7d441ea-dbd5-4c49-bb5f-12821558c6fe",
              "ragioneSociale": "Regione Lombardia",
              "annoRiferimento": 2022,
              "meseRiferimento": 12,
              "importo": 100,
              "dataFattura": "2025-02-10T00:00:00"
            }
          ]
        }
      ];
      setListaFatture([...addMockInviate,...res.data]);
      
      const array = res.data.map( el => el.tipologiaFattura);
      const ORDER = ["Anticipo", "Acconto", "Primo Saldo", "Secondo Saldo", "Var. Semestrale"];

      const toTitleCase = (str: string) =>
        str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
      //ATTENZIONE: SE verrà aggiunta un altra tipologia fattura bisogna aggiungerla nell'array ORDER ALTRIMENTI NON VERRà MAPPATA
      const uniqueArray = array
        .map(toTitleCase)
        .reduce((accumulator, current) => {
          if (!accumulator.includes(current)) {
            accumulator.push(current);
          }
          return accumulator;
        }, [])
        .sort((a, b) => {
          const indexA = ORDER.indexOf(a);
          const indexB = ORDER.indexOf(b);
          const rankA = indexA === -1 ? ORDER.length : indexA;
          const rankB = indexB === -1 ? ORDER.length : indexB;
          return rankA - rankB;
        });
                
      setTipologie([...["Tutte"],...uniqueArray]);
      /*
      let elOrdered = res.data.map((el,i) => {
        return {
          id:el.annoRiferimento+"-"+el.meseRiferimento+"-"+el.tipologiaFattura+"-"+i,
          tipologiaFattura: el.tipologiaFattura,   
          statoInvio: el.statoInvio,
          numeroFatture: el.numeroFatture,
          annoRiferimento: el.annoRiferimento,
          meseRiferimento: el.meseRiferimento,
          importo: el.importo.toLocaleString("de-DE", { style: "currency", currency: "EUR" })
        };
      }); 
      if(tipologia !== 'Tutte' ){
        elOrdered = elOrdered.filter(el => el.tipologiaFattura === tipologia.toUpperCase());
      }*/
      
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
    let tooltipObj:any = {label:'',title:''};
    if(row.statoInvio === 0){
      tooltipObj = {label:'Da inviare',title:'Da inviare',color:'#86E1FD'};
    }else if(row.statoInvio === 2){
      tooltipObj = {label:'Elaborazione',title:'La fattura è in elaborazione',color:"#FFE5A3"};
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

  const downloadReport = async () => {
    setShowDownloading(true);
    try {
      const response = await downloadReportRelNonFatturate(token, profilo.nonce, {tipologiaFattura:tipologia === 'Tutte' ? null : [tipologia]});
      if (!response.ok) throw '404';
      const blob = await response.blob();
      let title = `Lista Report Non Inviate.zip`;
      if (tipologia !== 'Tutte') {
        title = `Lista Report Non Inviate/${tipologia}.zip`;
      }
      saveAs(blob, title);
    } catch {
      manageErrorDownload('404', dispatchMainState);
    } finally {
      setShowDownloading(false);
    }
  };

  const clearOnChangeFilter = () => {
    setListaFatture([]);   
  };

  const onButtonFiltra = () => {
    console.log('Filtra button clicked');
  };

  const onButtonAnnulla = () => {
    console.log('Annulla button clicked');
  };

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [count, setCount] = useState(0);
  const [gridData, setGridData] = useState<Fattura[]>([]);
  const [objectSort, setObjectSort] = useState<{[key:string]:number}>({"Anno Riferimento":1,"Mese Riferimento":1});
  const [listaResponse, setListaResponse] = useState<any[]>([]);


  const [elementSelected,setElementSelected] = useState<SelectedJsonSap[]>([]);
  const [arrayCollapseSelected,setArrayCollapseSelected] = useState<SelectedJsonSap[]>([]);

  const manageCheckbox = (currentRow: Record<string, any>):Record<string, any>=> {
    const verifyIfSelected = !!elementSelected.find((el) =>{
      return el.annoRiferimento === currentRow.annoRiferimento &&
       el.meseRiferimento === currentRow.meseRiferimento && 
       el.tipologiaFattura === currentRow.tipologiaFattura &&
       el.idFattura === null;
    } );
    console.log({verifyIfSelected});
    if(verifyIfSelected){
      setElementSelected([]);
      return {
        checkboxStatus:false,
        key:"idFattura"
      };
    }else{
      setElementSelected([{
        annoRiferimento:currentRow.annoRiferimento,
        meseRiferimento:currentRow.meseRiferimento,
        tipologiaFattura:currentRow.tipologiaFattura,
        idFattura:null
      }]);
      return {
        checkboxStatus:true,
        key:"idFattura"
      };
    }
  };

  const manageCheckboxCollapse = (currentRow: Record<string, any>): Record<string, any> => {
    const verifyIfSelected = !!elementSelected.find((el) =>{
      return el.annoRiferimento === currentRow.annoRiferimento &&
       el.meseRiferimento === currentRow.meseRiferimento && 
       el.tipologiaFattura === currentRow.tipologiaFattura &&
       el.idFattura === currentRow.idFattura;

    } );
    if(verifyIfSelected){
      console.log("22222");
      setElementSelected(elementSelected.filter(el => el.idFattura !== currentRow.idFattura));
      return {
        checkboxStatus:false,
        key:"idFattura"
      };
    }else{
      console.log("dentro elelelel");
      setElementSelected((prev)=>{
        return [...prev,{
          annoRiferimento:currentRow.annoRiferimento,
          meseRiferimento:currentRow.meseRiferimento,
          tipologiaFattura:currentRow.tipologiaFattura,
          idFattura:currentRow.idFattura
        }];});
      return {
        checkboxStatus:true,
        key:"idFattura"
      };
    }
  };
  
  // va inserito dentro la fundione la logica del checkjed
  console.log({elementSelected});
  const handleGetDetails = (el: ListaFatture) => {
    navigate(PathPf.JSON_TO_SAP_DETAILS.replace(":id",`${el.annoRiferimento}-${el.meseRiferimento}-${el.tipologiaFattura}`));
  };

  const getDetailSingleRow = async (obj: {annoRiferimento: number,meseRiferimento: number,tipologiaFattura: string}): Promise<Record<string, any>[]> => {
    setCollapseDataLoading(true);
    try {
      const res = await sendListaJsonFatturePagoPa(token, profilo.nonce, obj);
      console.log('Response from sendListaJsonFatturePagoPa:', res);
      setCollapseDataLoading(false);
      return res.data;
    } catch {
      managePresaInCarico("ERROR_LIST_JSON_TO_SAP", dispatchMainState);
      navigate(PathPf.JSON_TO_SAP);
      setCollapseDataLoading(false); 
      return [];
    }
  };

  const handleGetDetailsRowCollapsed = async (el: Record<string, any>) => {
    if(!(el.annoRiferimento === 2022)){
      const resCollapseDetails = await getDetailSingleRow({
        annoRiferimento: el.annoRiferimento,
        meseRiferimento: el.meseRiferimento,
        tipologiaFattura: el.tipologiaFattura
      });
      setListaFatture((prevState) =>
        prevState.map((item) =>
          item.annoRiferimento === el.annoRiferimento &&
          item.tipologiaFattura === el.tipologiaFattura &&
          item.meseRiferimento === el.meseRiferimento &&
          item.statoInvio === el.statoInvio
            ? { ...item, fatture: resCollapseDetails }
            : item
        )
      );

      console.log('Row collapsed clicked:', el, resCollapseDetails);
      return resCollapseDetails;
    }else{
      setCollapseDataLoading(false);
    }
  };

  const headerAction = (
    label: string,
    setGridDataParam: (data: any[]) => void,
    emessiGrid = true,
    setObjectSort: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>,
    page: number,
    rowsPerPage: number,
    listaResponseParameter: any[],
  ) => {};

  const statusAnnulla = "hidden";
  console.log({listaFatture});
  return(

    <MainBoxStyled title={"Generazione JSON"}>
      <ResponsiveGridContainer >
        <MainFilter 
          filterName={"select_value_string"}
          inputLabel={"Anno"}
          clearOnChangeFilter={clearOnChangeFilter}
          setBody={setBodyFatturazione}
          body={bodyFatturazione}
          keyDescription={"anno"}
          keyValue={"anno"}
          keyBody={"anno"}
          arrayValues={arrayYears}
          extraCodeOnChange={(e)=>{
            callLista.current = false; 
            /* getMesi(e.toString());
            setDataSelect([]);
            setValueMultiselectTipologie([]);
            setValueAutocomplete([]);*/
          }}/>
        <MainFilter 
          filterName={"select_key_value"}
          inputLabel={"Mese"}
          clearOnChangeFilter={clearOnChangeFilter}
          setBody={setBodyFatturazione}
          body={bodyFatturazione}
          keyValue={"mese"}
          keyDescription='descrizione'
          keyBody={"mese"}
          defaultValue={""}
          arrayValues={arrayMonths}
          extraCodeOnChange={(e)=>{
            const value = Number(e);
            /* setBodyFatturazione((prev)=> ({...prev, ...{mese:value,tipologiaFattura:[]}}));
            getTipologieFatturazione(bodyFatturazione.anno,value,bodyFatturazione.cancellata);
            setValueMultiselectTipologie([]); */           
          }}/>
        <MainFilter 
          filterName={"select_key_value"}
          inputLabel={"Stato"}
          clearOnChangeFilter={clearOnChangeFilter}
          setBody={setBodyFatturazione}
          body={bodyFatturazione}
          keyValue={"id"}
          keyDescription='descrizione'
          keyBody={"cancellata"}
          defaultValue={""}
          arrayValues={[{id:1,descrizione:"Fatturate"},{id:2,descrizione:"Non fatturate"}]}
          extraCodeOnChange={(e)=>{
                                  
            const value = Number(e) === 1 ? false : true;
          /*  setBodyFatturazione((prev)=>({...prev,...{cancellata:value,tipologiaFattura:[]}}));
            getTipologieFatturazione(bodyFatturazione.anno,bodyFatturazione.mese,value);
            setValueMultiselectTipologie([]);    */   
          }}/>
        <MainFilter 
          filterName={"multi_checkbox"}
          inputLabel={"Tipologia Fattura"}
          clearOnChangeFilter={clearOnChangeFilter}
          setBody={setBodyFatturazione}
          body={bodyFatturazione}
          dataSelect={tipologieFatture}
          valueAutocomplete={valueMulitselectTipologie}
          setValueAutocomplete={setValueMultiselectTipologie}
          keyDescription={"tipologiaFattura"}
          keyValue={"tipologiaFattura"}
          keyBody={"tipologiaFattura"}
          extraCodeOnChangeArray={(e)=>{
            setValueMultiselectTipologie(e);
            setBodyFatturazione((prev) => ({...prev,...{tipologiaFattura:e}}));
          }}
          iconMaterial={RenderIcon("invoice",true)}/>
      </ResponsiveGridContainer>
      <FilterActionButtons 
        onButtonFiltra={onButtonFiltra} 
        onButtonAnnulla={onButtonAnnulla} 
        statusAnnulla={statusAnnulla} 
      />
      <ActionTopGrid
        actionButtonRight={[{
          onButtonClick:downloadReport,
          variant: "outlined",
          label: "Download Report Non Inviate",
          icon:{name:"download"},
          disabled:(listaFatture?.length === 0)
        }]}/>
      <div className="mt-1 mb-5" style={{ width: '100%'}}> 
        <GridCustom
          nameParameterApi='invioFatture'
          elements={listaFatture}
          changePage={onChangePageOrRowGrid}
          changeRow={onChangePageOrRowGrid} 
          total={count}
          page={page}
          rows={rowsPerPage}
          headerNames={headerNamesInvioFatture}
          headerNamesCollapse={headerNamesInvioFattureCollapse}
          apiGet={handleGetDetails}
          disabled={false}
          widthCustomSize="1600px"
          //setAction={showPopUpAction}
          manageCheckbox={manageCheckbox}
          manageCheckboxCollapse={manageCheckboxCollapse}
          filterOnCollapse={true}
          getAsyncDetails={handleGetDetailsRowCollapsed}
          collapseDataLoading={collapseDataLoading}
          selectedRow={elementSelected}
          headerActionSort={headerAction}
          setGridData={setGridData}
          gridType={true}
          setObjectSort={setObjectSort}
          objectSort={objectSort}
          listaResponse={listaResponse}
          sentenseEmpty={"Nessuna fattura disponibile"}
          keyCollapse={"fatture"}
          titleRowCollapse={"Dettaglio Fatture"}/>
        {/*  <DataGrid
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
          rowHeight={70}
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
        */}
      </div>
      <ModalLoading 
        open={showLoader} 
        setOpen={setShowLoader}
        sentence={'Loading...'} />
      <ModalLoading 
        open={showDownloading} 
        setOpen={setShowDownloading}
        sentence={'Downloading...'} />
    </MainBoxStyled>
  );
};
export default InvioFatture;


/*

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

                /////////////////////

 <div className="mx-5 mb-5">
        <div className="mt-5">
          <div className="row">
            <div className="col-3">
              <Box>
              
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
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
                  </Box>
                 
                </Box>
                     </div>
              </div>
            </div>
          </div>
        </div>
      </div>

                //////////////////////////
 */