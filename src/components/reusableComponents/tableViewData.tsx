import { Box, Button, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";

interface TableColumn {
  key: string;
  label: ReactNode;
  component?: (setValue: (value: any) => void, value: any, row: any) => ReactNode;
}

interface ElementToProcessComponentProps<T,> {
  obj: T;
  title?: ReactNode;
  keyValueObj: TableColumn[];
  closeIcon?: boolean;
  setOpen?: Dispatch<SetStateAction<boolean>>;
  showButton?:boolean;
  showCounter?:boolean;
  onComponentChange?: (row: any, key: string, value: any) => void;
}

export const ElementToProcessComponent = <T,> ({
  obj,
  title,
  keyValueObj,
  closeIcon = false,
  setOpen,
  showButton=false,
  showCounter=false,
  onComponentChange
}:ElementToProcessComponentProps<T>) => {
  // normalizza sempre a array, così gestiamo singolo obj o array con la stessa logica
  const rows = obj === null ? [] : Array.isArray(obj) ? obj : [obj];
  // valori dei component (TextField, Nota...) per riga: { [rowIndex]: { [key]: value } }
  const [componentValues, setComponentValues] = useState<Record<number, Record<string, any>>>({});
  // scroll oltre MAX_VISIBLE_ROWS righe: altezza calcolata per mostrarne esattamente 10
  const MAX_VISIBLE_ROWS = 10;
  const hasScroll = rows.length > MAX_VISIBLE_ROWS;
  const rowHeight = keyValueObj.some(el => el.component) ? 75 : 33;
  const headerHeight = 40;

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
        ...(rows.length > 10 && {
          maxHeight: 400,
          overflowY: 'auto',
          // niente padding in alto: con lo scroll lo stickyHeader deve aderire al bordo superiore
          padding: '0 10px 10px 10px',
          // bordo bianco attorno alla tabella: sta fuori dall'area di scroll, quindi non lascia vedere le righe
          border: '5px solid white',
          // secondo strato grigio esterno; width ridotta di 10px perché l'outline non occupa spazio nel layout
          outline: '5px solid #F8F8F8',
          width: 'calc(100% - 10px)',
        }),
      }}>
        <Table size="small" stickyHeader={rows.length > 10}>
          <TableHead>
            <TableRow sx={{ borderColor: "white", borderWidth: "thick" }}>
              {keyValueObj.map((el, i) => (
                <TableCell key={i} align="center" sx={{ marginLeft: "16px", backgroundColor: '#F8F8F8', borderBottom: '5px solid white' }}>
                  {el.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody sx={{ borderColor: "white", borderWidth: "thick" }}>
            {rows.map((rowObj, rowIndex) => (
              <TableRow key={rowIndex}>
                {keyValueObj.map((el, i) => {
                  // TODO: da eliminare
                  if (el.component) {
                    const componentValue = componentValues[rowIndex]?.[el.key] ?? '';
                    const setComponentValue = (newValue: any) => {
                      setComponentValues(prev => ({
                        ...prev,
                        [rowIndex]: { ...prev[rowIndex], [el.key]: newValue }
                      }));
                      onComponentChange && onComponentChange(rowObj, el.key, newValue);
                    };
                    return (
                      <TableCell key={i} align="center" sx={{ minWidth: 200 }}>
                        {el.component(setComponentValue, componentValue, rowObj)}
                      </TableCell>
                    );
                  }
                  const mockNumeroInvii = el.key === "statoInvio" && rowObj[el.key] === 4 ? 3 : 1;
                  // TODO da rispristinare const value = rowObj[el.key];
                  const value = el.key === "statoInvio" ? mockNumeroInvii : rowObj[el.key];
                  const textValue = value === null || value === undefined ? '' : String(value);
                  const isTruncated = typeof value === 'string' && value.length > 20;
                  return (
                    <Tooltip key={i} title={isTruncated ? value : null}>
                      <TableCell align="center">
                        {isTruncated ? `${textValue.slice(0, 20)}...` : textValue}
                      </TableCell>
                    </Tooltip>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      {showButton &&  
        <div className='container_buttons_modal d-flex justify-content-center mt-5'>
          <Button   variant='contained' onClick={()=> "ciao"} >Invia</Button>
        </div>
      }
    </Box>
  );
};