import { Box, IconButton, TableCellProps, Tooltip } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';


export interface WhiteListConfig {
  label: string;
  align: TableCellProps['align'];
  width: string | number;
  keyValue: string;
  gridAction?:(fun:(id) => void,color:string,disabled:boolean,obj:any) => JSX.Element,
}

export const headerNames: WhiteListConfig[] = [
  //{ label: '', align: 'center', width: '60px', keyValue: 'checkbox' },
  { label: 'Ragione Sociale', align: 'center', width: '200px', keyValue: 'ragioneSociale' },
  { label: 'Anno', align: 'center', width: '100px', keyValue: 'anno' },
  { label: 'Mese', align: 'center', width: '100px', keyValue: 'mese' },
  { label: 'Tipologia fattura', align: 'center', width: '150px', keyValue: 'tipologiaFatture' },
  { label: 'Tipo contratto', align: 'center', width: '150px', keyValue: 'tipoContratto' },
  { label: 'Stato', align: 'center', width: '100px', keyValue: 'stato' },
  { label: 'Azioni', align: 'center', width: '100px', keyValue: 'azioni',gridAction:(fun:(id) => void,color:string,disabled:boolean,obj:any) => {
    return (
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        {obj.stato === ""}
        <Tooltip title="Ripristina">
          <span>
            <IconButton
              size="medium"
              onClick={() => fun(obj)}
              disabled={disabled}
            >
              <RestoreIcon sx={{ color: color }} />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Elimina">
          <span>
            <IconButton
              size="medium"
              onClick={() => fun(obj)}
              disabled={disabled}
            >
              <DeleteIcon sx={{ color: color }} />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
     
    );
  } }
];


