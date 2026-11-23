import { Box, Button, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { forwardRef, memo, useCallback, useRef, useState } from "react";
import { TableVirtuoso } from "react-virtuoso";
import type { TableComponents } from "react-virtuoso";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { month } from "../../reusableFunction/reusableArrayObj";

interface TableColumn {
  key: string;
  label: ReactNode;
  component?: (setValue: (value: any) => void, value: any, row: any) => ReactNode;
}

interface ViewDataComponentProps<T,> {
  obj: T;
  title?: ReactNode;
  keyValueObj: TableColumn[];
  closeIcon?: boolean;
  setOpen?: Dispatch<SetStateAction<boolean>>;
  showButton?:boolean;
  showCounter?:boolean;
  onComponentChange?: (row: any, key: string, value: any) => void;
}

export const ViewDataComponent = <T,> ({
  obj,
  title,
  keyValueObj,
  closeIcon = false,
  setOpen,
  showButton=false,
  showCounter=false,
  onComponentChange
}:ViewDataComponentProps<T>) => {
 
  const rows = obj === null ? [] : Array.isArray(obj) ? obj : [obj];

  // callback stabile: le righe memoizzate non si ri-renderizzano se il parent ricrea onComponentChange
  const onComponentChangeRef = useRef(onComponentChange);
  onComponentChangeRef.current = onComponentChange;

  // valori digitati per riga: con la virtualizzazione le righe fuori vista vengono smontate,
  // quindi il loro stato locale va salvato qui e ripristinato al rimontaggio
  const valuesRef = useRef<Record<string, Record<string, any>>>({});

  const stableOnComponentChange = useCallback((row: any, key: string, value: any) => {
    const rowKey = getRowKeyProcess(row);
    valuesRef.current[rowKey] = { ...valuesRef.current[rowKey], [key]: value };
    onComponentChangeRef.current?.(row, key, value);
  }, []);

  const getSavedValues = useCallback((row: any) => valuesRef.current[getRowKeyProcess(row)] ?? {}, []);

  const virtualized = rows.length > 10;

  const headerCells = keyValueObj.map((el, i) => (
    <TableCell key={i} align="center" sx={{ marginLeft: "16px", backgroundColor: '#F8F8F8', borderBottom: '5px solid white' }}>
      {el.label}
    </TableCell>
  ));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mt: 2, mb: 2 }}>
      {closeIcon ? <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        width: '100%'
      }}>
        
        <div className="d-flex align-items-center justify-content-start" style={{ gap: 12 }}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {title}
          </Typography>
          {showCounter && (
            <Box
              sx={{
                minWidth: 34,
                height: 34,
                px: keyValueObj.length > 9 ? 0.75 : 0,
                borderRadius: '4px',
                backgroundColor: '#c1bcbc',
                color: 'black',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 600,
                lineHeight: 1,
              }}
            >
              {rows.length}
            </Box>
          )}
        </div>
        <div className="d-flex align-items-center justify-content-end">
          <div className='icon_close'>
            <CloseIcon onClick={() =>{ setOpen && setOpen(false);}} id='close_icon' sx={{color:'#17324D'}}></CloseIcon>
          </div>
        </div>
      </Box> : <Typography>{title}</Typography>}
      <Box  sx={{ 
        backgroundColor: '#F8F8F8', 
        padding: '10px',
        marginTop: '20px',
        width: '100%',
        ...(virtualized && {
          // lo scroll è gestito da TableVirtuoso (altezza fissa 400)
          // niente padding in alto: con lo scroll l'header fisso deve aderire al bordo superiore
          padding: '0 10px 10px 10px',
          // bordo bianco attorno alla tabella: sta fuori dall'area di scroll, quindi non lascia vedere le righe
          border: '5px solid white',
          // secondo strato grigio esterno; width ridotta di 10px perché l'outline non occupa spazio nel layout
          outline: '5px solid #F8F8F8',
          width: 'calc(100% - 10px)',
        }),
      }}>
        {virtualized ? (
          // virtualizzazione: vengono montate solo le righe visibili (+ un piccolo buffer),
          // quindi apertura/chiusura della modale non dipendono più dal numero di fatture
          <TableVirtuoso
            style={{ height: 400 }}
            data={rows}
            components={virtuosoComponents}
            computeItemKey={(index, rowObj) => rowObj?.idFattura ?? index}
            fixedHeaderContent={() => (
              <TableRow sx={{ borderColor: "white", borderWidth: "thick" }}>
                {headerCells}
              </TableRow>
            )}
            itemContent={(_index, rowObj) => (
              <ProcessRowCells
                rowObj={rowObj}
                keyValueObj={keyValueObj}
                onComponentChange={stableOnComponentChange}
                getSavedValues={getSavedValues}
              />
            )}
          />
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow sx={{ borderColor: "white", borderWidth: "thick" }}>
                {headerCells}
              </TableRow>
            </TableHead>
            <TableBody sx={{ borderColor: "white", borderWidth: "thick" }}>
              {rows.map((rowObj, rowIndex) => (
                <TableRow key={rowObj?.idFattura ?? rowIndex}>
                  <ProcessRowCells
                    rowObj={rowObj}
                    keyValueObj={keyValueObj}
                    onComponentChange={stableOnComponentChange}
                    getSavedValues={getSavedValues}
                  />
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Box>
      {showButton &&  
        <div className='container_buttons_modal d-flex justify-content-center mt-5'>
          <Button   variant='contained' onClick={()=> "ciao"} >Invia</Button>
        </div>
      }
    </Box>
  );
};

// chiave della riga per salvare i valori digitati (idFattura se presente)
const getRowKeyProcess = (row: any): string => String(row?.idFattura ?? JSON.stringify(row));

// componenti MUI usati da TableVirtuoso (definiti fuori dal render: riferimenti stabili)
const virtuosoComponents: TableComponents<any> = {
  Scroller: forwardRef<HTMLDivElement>((props, ref) => <div {...props} ref={ref} />),
  Table: (props) => <Table {...props} size="small" sx={{ borderCollapse: 'separate', tableLayout: 'auto' }} />,
  TableHead: forwardRef<HTMLTableSectionElement>((props, ref) => <TableHead {...props} ref={ref} />),
  TableRow: ({ item: _item, ...props }) => <TableRow {...props} />,
  TableBody: forwardRef<HTMLTableSectionElement>((props, ref) => (
    <TableBody {...props} ref={ref} sx={{ borderColor: "white", borderWidth: "thick" }} />
  )),
};

interface ProcessRowCellsProps {
  rowObj: any;
  keyValueObj: TableColumn[];
  onComponentChange: (row: any, key: string, value: any) => void;
  // valori digitati in precedenza (riga smontata dalla virtualizzazione e poi rimontata)
  getSavedValues: (row: any) => Record<string, any>;
}

// celle di una riga, memoizzate, con stato locale degli input: digitare ri-renderizza solo questa riga
const ProcessRowCells = memo(({ rowObj, keyValueObj, onComponentChange, getSavedValues }: ProcessRowCellsProps) => {
  const [componentValues, setComponentValues] = useState<Record<string, any>>(() => getSavedValues(rowObj));

  return (
    <>
      {keyValueObj.map((el, i) => {
        if (el.component) {
          // undefined finché l'utente non digita: il component può ricadere sul valore della riga
          const componentValue = componentValues[el.key];
          const setComponentValue = (newValue: any) => {
            setComponentValues(prev => ({ ...prev, [el.key]: newValue }));
            onComponentChange(rowObj, el.key, newValue);
          };
          return (
            <TableCell key={i} align="center" sx={{ maxWidth: 150 }}>
              {el.component(setComponentValue, componentValue, rowObj)}
            </TableCell>
          );
        }
        let value = rowObj[el.key];
        if (el.key === "meseRiferimento") {
          value = month[rowObj[el.key] - 1];
        }

        const textValue = value === null || value === undefined ? '' : String(value);
        const isTruncated = typeof value === 'string' && value.length > 20;
        // title nativo al posto del Tooltip MUI: con centinaia di righe il Tooltip (Popper, listener, ref)
        // rende lento il mount/unmount della tabella, cioè apertura e chiusura della modale
        return (
          <TableCell key={i} align="center" title={isTruncated ? textValue : undefined}>
            {isTruncated ? `${textValue.slice(0, 20)}...` : textValue}
          </TableCell>
        );
      })}
    </>
  );
});
ProcessRowCells.displayName = "ProcessRowCells";