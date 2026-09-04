import { Box, Button, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import type { Dispatch, ReactNode, SetStateAction } from "react";

interface TableColumn {
  key: string;
  label: ReactNode;
}

interface ElementToProcessComponentProps<T,> {
  obj: T;
  title?: ReactNode;
  keyValueObj: TableColumn[];
  closeIcon?: boolean;
  setOpen?: Dispatch<SetStateAction<boolean>>;
  showButton?:boolean
}

export const ElementToProcessComponent = <T,> ({
  obj,
  title,
  keyValueObj,
  closeIcon = false,
  setOpen,
  showButton=false
}: ElementToProcessComponentProps<T>) => {
  // normalizza sempre a array, così gestiamo singolo obj o array con la stessa logica
  const rows = obj === null ? [] : Array.isArray(obj) ? obj : [obj];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mt: 2, mb: 2 }}>
      {closeIcon ? <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        width: '100%'
      }}>
        <div className='d-flex align-items-center justify-content-start'>
          <Typography id="modal-modal-title" variant="h6" component="h2">{title}</Typography>
        </div>
        <div className="d-flex align-items-center justify-content-end">
          <div className='icon_close'>
            <CloseIcon onClick={() =>{ setOpen && setOpen(false);}} id='close_icon' sx={{color:'#17324D'}}></CloseIcon>
          </div>
        </div>
      </Box> : <Typography>{title}</Typography>}
      
      
      <Box sx={{ backgroundColor: '#F8F8F8', padding: '10px', marginTop: '20px', width: '100%' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ borderColor: "white", borderWidth: "thick" }}>
              {keyValueObj.map((el, i) => (
                <TableCell key={i} align="center" sx={{ marginLeft: "16px" }}>
                  {el.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody sx={{ borderColor: "white", borderWidth: "thick" }}>
            {rows.map((rowObj, rowIndex) => (
              <TableRow key={rowIndex}>
                {keyValueObj.map((el, i) => {
                  const value = rowObj[el.key];
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
          <Button  variant='contained' onClick={()=> "ciao"} >Invia</Button>
        </div>
      }
    </Box>
  );
};