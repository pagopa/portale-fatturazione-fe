import { Box, Collapse, FormControl, InputLabel, MenuItem, Select, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { HeaderGridCustom } from "../gridCustom";
import GridCell from "./gridCell";
import { useState, useMemo } from 'react';


interface GridRowsRendererProps<T = any>{
  element: any;
  apiGet?: (el: any) => void;
  headerNames:HeaderGridCustom[];
  headerNamesCollapse?: HeaderGridCustom[];
  setAction?: (obj:T, action:string) => void;
  titleRowCollapse?:string,
  keyCollapse?:string,
  bgColorRowFunction?: (element:any) => string;
  manageCheckbox?: ( currentRow:T) => boolean;
  manageCheckboxCollapse?:(currentRow:K) => boolean,
  filterOnCollapse:boolean
}

const GridRowDesignByConfigFile =  ({
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
  filterOnCollapse
}: GridRowsRendererProps) => {

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
                  gap={2}
                  alignItems="center"
                  sx={{ marginBottom: '10px' }}
                >
                  <Typography sx={{ marginLeft: "6px" }} variant="h6" gutterBottom component="div">
                    {titleRowCollapse}
                  </Typography>
                  {filterOnCollapse &&
                  <Stack direction="row" spacing={2}>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>Anno</InputLabel>
                      <Select
                        value={filtroAnno}
                        label="Anno"
                        onChange={(e) => setFiltroAnno(e.target.value)}
                      >
                        <MenuItem value="tutti">Tutti</MenuItem>
                        {anniDisponibili.map((anno: number) => (
                          <MenuItem key={anno} value={anno}>{anno}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 140 }}>
                      <InputLabel>Mese</InputLabel>
                      <Select
                        value={filtroMese}
                        label="Mese"
                        onChange={(e) => setFiltroMese(e.target.value)}
                      >
                        <MenuItem value="tutti">Tutti</MenuItem>
                        {mesiDisponibili.map((mese: number) => (
                          <MenuItem key={mese} value={mese}>{nomiMesi[mese - 1]}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 160 }}>
                      <InputLabel>Tipologia Fattura</InputLabel>
                      <Select
                        value={filtroTipologia}
                        label="Tipologia Fattura"
                        onChange={(e) => setFiltroTipologia(e.target.value)}
                      >
                        <MenuItem value="tutti">Tutte</MenuItem>
                        {tipologieDisponibili.map((tipo: string) => (
                          <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>
                  }
                </Stack>

                <Table size="small" aria-label="purchases">
                  <TableHead>
                    <TableRow sx={{ borderColor: "white", borderWidth: "thick" }}>
                      {
                        Object.values(headerNamesCollapse)?.map((value: any, i: number) => {
                          return (
                            <TableCell key={`position-${value.label}-${i}`} align='center'>{value.label}</TableCell>
                          );
                        })
                      }
                    </TableRow>
                  </TableHead>
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
                            />
                          )
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow> 
      }
    </>
  );
};


export default  GridRowDesignByConfigFile;