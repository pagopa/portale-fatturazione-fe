import { Box, Collapse, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { HeaderGridCustom } from "../gridCustom";
import GridCell, { RowLoading } from "./gridCell";
import { useState, useEffect } from 'react';
import Loader from "../../loader";
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
  manageCheckbox?: ( currentRow:Record<string, any>, dettagli?:Record<string, any>[]) => void;
  manageCheckboxCollapse?:(currentRow:Record<string, any>) => Record<string, any>,
  // detailsLoading: true finché sono in corso le chiamate del dettaglio della riga
  filterOnCollapse?:(element:any, detailsLoading?:boolean) => React.ReactNode,
  getAsyncDetails?:(currentRow:Record<string, any>,val?:boolean) => Promise<Record<string, any>[]> | void,
  collapseDataLoading?:boolean,
  selectedRows:K[],
  manageStateCheckbox?:(currentRow:Record<string, any>,val:string,array:Record<string, any>[]) => {verifyIfSelected:boolean,disabled:boolean},
  colSpanCollaps?:number
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
  manageStateCheckbox,
  colSpanCollaps=7
}: GridRowsRendererProps<T,K>) => {

  const [open, setOpen] = useState(false);
  // caricamento dettagli della riga, condiviso tra main checkbox e checkbox del collapse
  const [rowLoading, setRowLoading] = useState<RowLoading>("none");
 


  let dataInsideCollapse = element[keyCollapse]||[];
  if (typeof dataInsideCollapse === 'string') {
    dataInsideCollapse = [JSON.parse(dataInsideCollapse)];
  } 

  if (dataInsideCollapse[0] && "numeroLinea" in dataInsideCollapse[0]) {
    dataInsideCollapse = [...dataInsideCollapse].sort((a, b) => a.numeroLinea - b.numeroLinea);
  }

  //_________________________________________________________________

  // Paginazione lato client del dettaglio (collapse)
  const [pageCollapse, setPageCollapse] = useState(0);
  const [rowsCollapse, setRowsCollapse] = useState(10);
  const totalCollapse = dataInsideCollapse.length;

  // se i dati cambiano (es. filtri) e la pagina corrente non esiste più, torno alla prima
  useEffect(() => {
    if (pageCollapse * rowsCollapse >= totalCollapse) setPageCollapse(0);
  }, [totalCollapse]);

  const dataInsideCollapsePaginated = dataInsideCollapse.slice(
    pageCollapse * rowsCollapse,
    pageCollapse * rowsCollapse + rowsCollapse
  );


  // Dentro il componente, prima del return
  const [filtroAnno, setFiltroAnno] = useState<string>('tutti');
  const [filtroMese, setFiltroMese] = useState<string>('tutti');
  const [filtroTipologia, setFiltroTipologia] = useState<string>('tutti');


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
            rowLoading={rowLoading}
            setRowLoading={setRowLoading}
          />
        ))}
      </TableRow>
      {(headerNamesCollapse && titleRowCollapse) &&
        <TableRow key={`tableRow-position-${element.id}`} >
          <TableCell style={{ paddingBottom: 0, paddingTop: 0}} colSpan={colSpanCollaps}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 2, backgroundColor: '#F8F8F8', padding: '10px', width: 0, minWidth: 'calc(100% - 16px)', overflowX: 'auto' }}>
                <Stack
                  direction="row"
                  gap={4}
                  alignItems="center"
                  sx={{marginBottom:"10px"}}
                >
                  <Typography sx={{ marginLeft: "6px" }} variant="h6" gutterBottom component="div">
                    {titleRowCollapse}
                  </Typography>
                  {filterOnCollapse && filterOnCollapse(element, rowLoading !== "none")}
                </Stack>
                <>
                  <Table  size="small" aria-label="purchases">
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
                        {dataInsideCollapsePaginated?.map((el: any, rowIndex: number) => (
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
                                  rowLoading={rowLoading}
                                  setAction={setAction}
                                />
                              )
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    )}
                  </Table>
                  {!collapseDataLoading && (
                    <CustomTablePagination
                      total={totalCollapse}
                      page={pageCollapse}
                      rows={rowsCollapse}
                      changePage={(_e, newPage) => setPageCollapse(newPage)}
                      changeRow={(e) => {
                        setRowsCollapse(parseInt(e.target.value, 10));
                        setPageCollapse(0);
                      }}
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