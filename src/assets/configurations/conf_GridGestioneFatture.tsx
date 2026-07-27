import { Box, Chip, IconButton, TableCellProps, Tooltip } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import NoteIcon from '@mui/icons-material/Note';
import CancelIcon from '@mui/icons-material/Cancel';


export interface GestioneFattureConfig {
  label: string;
  align: TableCellProps['align'];
  width: string | number;
  keyValue: string;
  gridAction?:(fun:(obj:any,action:string)=>void,color:string,disabled:boolean,obj:any) => JSX.Element,
}

export const headerNamesGestioneFatture: GestioneFattureConfig[] = [
  //{ label: '', align: 'center', width: '60px', keyValue: 'checkbox' },
  { label: 'Ragione Sociale', align: 'center', width: '200px', keyValue: 'ragioneSociale' },
  { label: 'Anno', align: 'center', width: '100px', keyValue: 'anno' },
  { label: 'Mese', align: 'center', width: '100px', keyValue: 'mese' },
  { label: 'Tipologia fattura', align: 'center', width: '150px', keyValue: 'tipologiaFattura' },
  { label: 'Tipo contratto', align: 'center', width: '150px', keyValue: 'tipoContratto' },
  { label: 'Stato', align: 'center', width: '100px', keyValue: 'stato',
    gridAction:(fun:(obj:any,action:string) => void,color:string,disabled:boolean,obj:any) => {

      let colorChip:string|undefined = undefined;
    
      if(obj.stato === "RIPRISTINATA"){
        colorChip = '#B5E2B4';
      }else if(obj.stato === "POSTICIPATA"){
        colorChip = '#FFE5A3';
      }else if(obj.stato === "ELIMINATA"){
        colorChip = '#FFF0F5';
      }
      return (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Chip variant="outlined" label={obj.stato} sx={{backgroundColor:colorChip}}  />
        </Box>
     
      );
    }
  },
  { label: 'Nota', align: 'center', width: '70px', keyValue: 'nota', gridAction:(fun:(el:any,action:string) => void,color:string,disabled:boolean,obj:any) => {
    return (
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Tooltip title={"Vedi le note"}>
          <span>
            <IconButton
              size="medium"
              onClick={() => fun && fun(obj,'nota')}
              disabled={disabled}
            >
              <NoteIcon sx={{ color: color }} />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
     
    );
  } },
  { label: 'Azioni', align: 'center', width: '100px', keyValue: 'azioni',gridAction:(fun:(el:any,action:string) => void,color:string,disabled:boolean,obj:any) => {
    return (
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        {obj.stato === "POSTICIPATA" ? 
          <>
            <Tooltip title="Ripristina">
              <span>
                <IconButton
                  size="medium"
                  onClick={() =>{
                    fun && fun(obj,'ripristina');
                  } }
                  disabled={disabled}
                >
                  <RestoreIcon sx={{ color: color }} />
                </IconButton>
              </span>
            </Tooltip> 
            <Tooltip title="Annulla">
              <span>
                <IconButton
                  size="medium"
                  onClick={() => fun && fun(obj,'annulla')}
                  disabled={disabled}
                >
                  <CancelIcon sx={{ color: color }} />
                </IconButton>
              </span>
            </Tooltip>
          </>
          : obj.stato === "ELIMINATA" ?  <Tooltip title="Annulla">
            <span>
              <IconButton
                size="medium"
                onClick={() => fun && fun(obj,'annulla eliminazione')}
                disabled={disabled}
              >
                <CancelIcon sx={{ color: color }} />
              </IconButton>
            </span>
          </Tooltip> : undefined
        }
      </Box>
     
    );
  } }
];


