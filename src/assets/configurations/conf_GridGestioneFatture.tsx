import { Box, IconButton, Tooltip } from "@mui/material";
import RestoreIcon from '@mui/icons-material/Restore';
import NoteIcon from '@mui/icons-material/Note';
import CancelIcon from '@mui/icons-material/Cancel';
import { HeaderGridCustom } from "../../components/reusableComponents/grid/gridCustom";


const getStatusColor = (obj: any): string => {
  let colorChip:string|undefined = "";

  if(obj.azione === "RIPRISTINATA"){
    colorChip = '#B5E2B4';
  }else if(obj.azione === "POSTICIPATA"){
    colorChip = '#FFE5A3';
  }else if(obj.azione === "ELIMINATA"){
    colorChip = '#ef9a9a';
  }
  return colorChip;
};

const getActionGestioneFatture = (obj,fun) => {
  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      {obj.azione === "POSTICIPATA" ? 
        <>
          <Tooltip title="Ripristina">
            <span>
              <IconButton
                size="medium"
                onClick={() =>{
                  if(fun) fun(obj,'ripristina');
                } }
              >
                <RestoreIcon  />
              </IconButton>
            </span>
          </Tooltip> 
          <Tooltip title="Annulla">
            <span>
              <IconButton
                size="medium"
                onClick={() => fun && fun(obj,'annulla')}
              >
                <CancelIcon  />
              </IconButton>
            </span>
          </Tooltip>
        </>
        : (obj.azione === "ELIMINATA") ?  <Tooltip title="Annulla">
          <span>
            <IconButton
              size="medium"
              onClick={() => fun && fun(obj,'annulla eliminazione')}
              disabled={ obj.idFattura !== null}
            >
              <CancelIcon />
            </IconButton>
          </span>
        </Tooltip> : undefined
      }
    </Box>
     
  );};

const showNoteGestioneFatture = (obj,fun) => {
  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <Tooltip title={"Vedi le note"}>
        <span>
          <IconButton
            size="medium"
            onClick={() => fun && fun(obj,'note')}
          >
            <NoteIcon/>
          </IconButton>
        </span>
      </Tooltip>
    </Box> 
  );
};

export const headerNamesGestioneFatture: HeaderGridCustom[] = [
  { label: 'Ragione Sociale', align: 'center', width: '200px', keyValue: 'ragioneSociale',typeColumn: "ragionesociale", makeAction: false, applyCss: true  },
  { label: 'Anno', align: 'center', width: '100px', keyValue: 'anno',typeColumn: "string" },
  { label: 'Mese', align: 'center', width: '100px', keyValue: 'mese',typeColumn: "mese-number" },
  { label: 'Tipologia fattura', align: 'center', width: '180px', keyValue: 'tipologiaFattura', typeColumn: "string" },
  { label: 'Tipo contratto', align: 'center', width: '150px', keyValue: 'idTipoContratto', typeColumn: "number-tipocontratto" },
  { label: 'Stato', align: 'center', width: '100px', keyValue: 'azione',typeColumn: "chip" ,funToManipulateValue:getStatusColor,keyToManipulateData:"azione" },
  { label: 'Nota', align: 'center', width: '70px', keyValue: 'note', typeColumn: "action",funToManipulateValue:showNoteGestioneFatture },
  { label: 'Azioni', align: 'center', width: '100px', keyValue: "azione", typeColumn: "action" ,funToManipulateValue:getActionGestioneFatture}
];


