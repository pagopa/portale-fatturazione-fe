import { Box, Button, Collapse, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { HeaderGridCustom } from "../gridCustom";
import GridCell from "./gridCell";
import { useState, useMemo } from 'react';
import Loader from "../../loader";
import MainFilter from "../../mainFilter";
import CustomTablePagination from "../pagination";


interface GridRowsRendererProps<T ,K>{
  element: any;
  apiGet?: (el: any) => void;
  headerNames:HeaderGridCustom[];
  headerNamesCollapse?: HeaderGridCustom[];
  setAction?: (obj:T, action:string) => void;
  titleRowCollapse?:string,
  keyCollapse?:string,
  bgColorRowFunction?: (element:any) => string;
  manageCheckbox?: ( currentRow:Record<string, any>) => Record<string, any>;
  manageCheckboxCollapse?:(currentRow:Record<string, any>) => Record<string, any>,
  filterOnCollapse:boolean,
  getAsyncDetails?:(currentRow:Record<string, any>,val:boolean) => void,
  collapseDataLoading?:boolean,
  selectedRows:K[],
  manageStateCheckbox?:(currentRow:Record<string, any>,val:string,array:Record<string, any>[]) => {verifyIfSelected:boolean,disabled:boolean},
}

const GridRowDesignByConfigFile=<T,K>({
  element,
  apiGet,
  headerNames,
  headerNamesCollapse,
  titleRowCollapse,
  keyCollapse="",
  setAction,
  bgColorRowFunction,
  manageCheckbox,
  manageCheckboxCollapse,
  filterOnCollapse,
  getAsyncDetails,
  collapseDataLoading,
  selectedRows=[],
  manageStateCheckbox
}: GridRowsRendererProps<T,K>) => {

  const [open, setOpen] = useState(false);
 


  let dataInsideCollapse = element[keyCollapse]||[];
  if (typeof dataInsideCollapse === 'string') {
    dataInsideCollapse = [JSON.parse(dataInsideCollapse)];
  } 

  if (dataInsideCollapse[0] && "numeroLinea" in dataInsideCollapse[0]) {
    dataInsideCollapse = [...dataInsideCollapse].sort((a, b) => a.numeroLinea - b.numeroLinea);
  }

  //_________________________________________________________________

 

  // Dentro il componente, prima del return
  const [filtroAnno, setFiltroAnno] = useState<string>('tutti');
  const [filtroMese, setFiltroMese] = useState<string>('tutti');
  const [filtroTipologia, setFiltroTipologia] = useState<string>('tutti');

  // Calcola le opzioni disponibili dinamicamente dai dati (evita valori duplicati)
  const anniDisponibili : number[]= useMemo(
    () => [...new Set(dataInsideCollapse?.map((el: any) => el.annoRiferimento))].sort(),
    [dataInsideCollapse]
  );

  const mesiDisponibili : number[] = useMemo(
    () => [...new Set(dataInsideCollapse?.map((el: any) => el.meseRiferimento))].sort((a, b) => a - b),
    [dataInsideCollapse]
  );

  const tipologieDisponibili : string[] = useMemo(
    () => [...new Set(dataInsideCollapse?.map((el: any) => el.tipologiaFattura))],
    [dataInsideCollapse]
  );

  // Applica i filtri ai dati
  const datiFiltrati = useMemo(() => {
    return dataInsideCollapse?.filter((el: any) => {
      const matchAnno = filtroAnno === 'tutti' || el.annoRiferimento === Number(filtroAnno);
      const matchMese = filtroMese === 'tutti' || el.meseRiferimento === Number(filtroMese);
      const matchTipologia = filtroTipologia === 'tutti' || el.tipologiaFattura === filtroTipologia;
      return matchAnno && matchMese && matchTipologia;
    });
  }, [dataInsideCollapse, filtroAnno, filtroMese, filtroTipologia]);

  // Mappa numero mese -> nome (se ti serve una label leggibile)
  const nomiMesi = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];

  //________________________________________________________________

  return (
    <>
      <TableRow sx={{
        height: '80px',
        borderTop: '4px solid #F2F2F2',
        borderBottom: '2px solid #F2F2F2',
        backgroundColor: bgColorRowFunction ? bgColorRowFunction(element) : undefined,
        '&:hover': {
          backgroundColor: '#EDEFF1',
        },
      }}>
        {Object.values(headerNames).map((rowObject: HeaderGridCustom, i: number) => (
          <GridCell
            key={`${rowObject.keyValue}-${i}`}
            rowObject={rowObject}
            index={i}
            element={element}
            headerNames={headerNames}
            apiGet={apiGet}
            isRowOpen={open}  
            onToggleRow={() => setOpen(!open)}
            setAction={setAction}
            manageCheckbox={manageCheckbox}
            getAsyncDetails={getAsyncDetails}
            selectedRows={selectedRows}
            manageStateCheckbox={manageStateCheckbox}
            usedInside={"main-row"}
          />
        ))}
      </TableRow>
      {(headerNamesCollapse && titleRowCollapse) &&
        <TableRow key={`tableRow-position-${element.id}`} >
          <TableCell style={{ paddingBottom: 0, paddingTop: 0}} colSpan={7}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 2, backgroundColor: '#F8F8F8', padding: '10px' }}>

                <Stack
                  direction="row"
                  gap={4}
                  alignItems="center"
                  sx={{marginBottom:"10px"}}
                 
                >
                  <Typography sx={{ marginLeft: "6px" }} variant="h6" gutterBottom component="div">
                    {titleRowCollapse}
                  </Typography>
                  {filterOnCollapse &&
               <>
                 <MainFilter 
                   sizeHeight={"small"}
                   filterName={"multi_checkbox"}
                   inputLabel={"Rag. Soc. Ente"}
                   clearOnChangeFilter={()=> null}
                   setBody={() => null}
                   body={{}}
                   keyCompare={""}
                   dataSelect={[]}
                   setTextValue={() => null}
                   textValue={""}
                   valueAutocomplete={[]}
                   setValueAutocomplete={() => null}
                   keyDescription={"descrizione"}
                   keyValue={"idEnte"}
                   keyOption='descrizione'
                   keyBody={"idEnti"} />
                 <MainFilter 
                   sizeHeight={"small"}
                   filterName={"input_text"}
                   inputLabel={"Numero Fattura"}
                   clearOnChangeFilter={() => null}
                   setBody={() => null}
                   body={{}}
                   keyDescription='iun'
                   keyBody={"iun"}
                   keyValue={"iun"}/>
                 
                 <MainFilter 
                   sizeHeight={"small"}
                   filterName={"date_from_to"}
                   inputLabel={"Data Fattura"}
                   clearOnChangeFilter={() => null}
                   setBody={() => null}
                   body={{}}
                   keyValue={"init"}
                   keyDescription="start"
                   keyBody="init"
                   keyCompare="il nulla"
                   error={false}
                 />
                 <Button disabled={manageStateCheckbox && manageStateCheckbox(element,"",selectedRows)?.disabled || selectedRows.length === 0} onClick={apiGet} size={"small"} variant="outlined">Generazione Json</Button>
               </> }
                </Stack>
                <>
                  <Table size="small" aria-label="purchases">
                    <TableHead>
                      <TableRow sx={{ borderColor: "white", borderWidth: "thick" }}>
                        {Object.values(headerNamesCollapse)?.map((value: any, i: number) => (
                          <TableCell key={`position-${value.label}-${i}`} align='center'>
                            {value.label}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    {collapseDataLoading ? (
                      <TableBody sx={{ borderColor: "white", borderWidth: "thick" }}>
                        <TableRow>
                          <TableCell 
                            colSpan={Object.keys(headerNamesCollapse).length} 
                            sx={{ textAlign: "center", border: "none" }}
                          >
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
                              <Loader sentence={"Caricamento..."} />
                            </Box>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    ) : (
                      <TableBody sx={{ borderColor: "white", borderWidth: "thick" }}>
                        {dataInsideCollapse?.map((el: any, rowIndex: number) => (
                          <TableRow key={`row-${rowIndex}`}>
                            {Object.values(headerNamesCollapse).map(
                              (rowObjectCollapsed: HeaderGridCustom, colIndex: number) => (
                                <GridCell
                                  key={`${rowObjectCollapsed.keyValue}-${colIndex}`}
                                  rowObject={rowObjectCollapsed}
                                  index={colIndex}
                                  element={el}
                                  headerNames={headerNamesCollapse}
                                  manageCheckboxCollapse={manageCheckboxCollapse}
                                  selectedRows={selectedRows}
                                  manageStateCheckbox={manageStateCheckbox}
                                  usedInside={"collapse-row"}
                                />
                              )
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    )}
                  </Table>

                  {/* ✅ ora è FUORI dalla Table, come sibling */}
                  {!collapseDataLoading && (
                    <CustomTablePagination
                      total={0}
                      page={1}
                      rows={10}
                      changePage={() => null}
                      changeRow={() => null}
                    />
                  )}
                </>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow> 
      }
    </>
  );
};


export default  GridRowDesignByConfigFile;