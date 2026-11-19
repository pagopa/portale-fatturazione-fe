import { Box, IconButton, TextField, Tooltip } from "@mui/material";
import { HeaderGridCustom } from "../../components/reusableComponents/grid/gridCustom";
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import { useState } from "react";
import { isValidNumeroDocumentoStorno, isValidText2NotaPii } from "../../reusableFunction/function";

const getChipElaborazione = (row) =>{
  let tooltipObj:any = {label:'',title:''};
  if(row.statoInvio === "DA_INVIARE"){
    tooltipObj = {label:'Da inviare',title:'Da inviare',color:'#86E1FD'};
  }else if(row.statoInvio === "IN_ELABORAZIONE"){
    tooltipObj = {label:'Elaborazione',title:'La fatture sono in elaborazione',color:"#FFE5A3"};
  }else if(row.statoInvio === "INVIATE"){
    tooltipObj = {label:'Inviate',title:'La fattura sono state inviate',color:'#B5E2B4'};
  }
  return tooltipObj;
};

const getChipElaborazioneCollapse = (row) =>{
  let tooltipObj:any = {label:'',title:''};
  if(row.statoInvio === "DA_INVIARE"){
    tooltipObj = {label:'Da inviare',title:'Da inviare',color:'#86E1FD'};
  }else if(row.statoInvio === "IN_ELABORAZIONE"){
    tooltipObj = {label:'Elaborazione',title:'La fattura è in elaborazione',color:"#FFE5A3"};
  }else if(row.statoInvio === "INVIATE" && row.numeroInvii === 1){
    tooltipObj = {label:'Inviata',title:'La fattura è stata inviata',color:'#B5E2B4'};
  }else if(row.statoInvio === "INVIATE" && row.numeroInvii > 1){
    tooltipObj = {label:'Re-Inviata',title:'La fattura è stata re-inviata',color:'#B5E2B4'};
  }
  return tooltipObj;
};

const isNomeFileDisabled = (row) => {
  return (row.nomeFile === null || row.nomeFile === "") ? true : false;
};

//TODO valutare di  cambiare a fine sviluppo
const showNoteGestioneFatture = (obj,fun) => {
  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <Tooltip title={"Date di invio"}>
        <span>
          <IconButton
            size="medium"
            disabled={obj.storicoInvii.length === 0 || obj.statoInvio === "DA_INVIARE"}
            onClick={() => fun && fun(obj,'note')}
          >
            <FormatListBulletedIcon/>
          </IconButton>
        </span>
      </Tooltip>
    </Box> 
  );
};

export const headerNamesInvioFatture: HeaderGridCustom[] = [
  { label: "", align: "center", width: "30px", keyValue: "", typeColumn: 'checkbox' },
  { label: "", align: "center", width: "30px", keyValue: "collaps", typeColumn: "collaps" },
  { label: "Tipologia Fattura", align: "center", width: "200px", keyValue: "tipologiaFattura", typeColumn: 'string', applyCss: true },
  { label: "Stato Invio",align: "center", width: "100px",keyValue: "statoInvio", typeColumn: "chip-tooltip" ,funToManipulateValue:getChipElaborazione},
  { label: "Numero Fatture", align: "center", width: "150px", keyValue: "numeroFatture", typeColumn: 'number' },
  { label: "Anno Riferimento", align: "center", width: "150px", keyValue: "annoRiferimento", typeColumn: 'string',headerActionSort:false, },
  { label: "Mese Riferimento", align: "center", width: "150px", keyValue: "meseRiferimento", typeColumn: 'mese-number',headerActionSort:false },
  { label: "Importo", align: "center", width: "150px", keyValue: "importoTotale", typeColumn: 'euro' },
  // {label:"", align:"center", width:"80px", keyValue:"arrow", typeColumn:"arrow"}
];

export const headerNamesInvioFattureCollapse: HeaderGridCustom[] = [
  { label: "", align: "center", width: "30px", keyValue: "", typeColumn: 'checkbox' },
  { label: "N. Fattura", align: "center", width: "150px", keyValue: "idFattura", typeColumn: 'number' },
  { label: "T. Fattura", align: "center", width: "180px", keyValue: "tipologiaFattura", typeColumn: 'string' },
  { label: "Stato Invio",align: "center", width: "150px",keyValue: "statoInvio", typeColumn: "chip-tooltip" ,funToManipulateValue:getChipElaborazioneCollapse},
  { label: "Ragione Sociale", align: "center", width: "200px", keyValue: "ragioneSociale", typeColumn: 'ragionesociale' },
  { label: "Importo", align: "center", width: "150px", keyValue: "importo", typeColumn: 'euro' },
  { label: "FK ID Doc.", align: "center", width: "150px", keyValue: "idDocumento", typeColumn: 'string' },
  { label: "D. Fat.", align: "center", width: "180px", keyValue: "dataFattura", typeColumn: 'data' },
  { label: "D. Ultima Gen.", align: "center", width: "250px", keyValue: "dataUltimaGenerazione", typeColumn: 'data-ora' },
  { label: "File JSON", align: "center", width: "30px", keyValue: "nomeFile", typeColumn:"snackbar",icon:"file_invio_sap",sentenceSnackbar:"Nome del file copiato!", disabledFunction:isNomeFileDisabled },
  { label: 'Date Invio', align: 'center', width: '150px', keyValue: 'storicoInvii', typeColumn: "action",funToManipulateValue:showNoteGestioneFatture },
];

export const keyValueObjModalInfo = [
  {
    key:"ragioneSociale",
    label:"Ragione Sociale",
  },
  {
    key:"annoRiferimento",
    label:"Anno Riferimento"
  },
  {
    key:"meseRiferimento",
    label:"Mese Riferimento"
  },
  {
    key:"tipologiaFattura",
    label:"Tipologia Fattura"
  },
  {
    key:"numeroInvii",
    label:"N. Invio"
  },
  {
    key:"idStorno-component",
    label:"N. Doc. Di Storno",
    component:(setNumeroDocStorno, value,row)=> {
      const [focused, setFocused] = useState(false);
      return (
        <Box  sx={{
          position: 'relative',
          width: 130,
          height: 40,
          ml: 'auto',            // centers the Box itself inside its container (e.g. a table cell)
        }}>
          <TextField
            multiline
            minRows={1}
            maxRows={focused ? undefined : 1}   // focused: grows with content; otherwise: one line
            size="small"
            label="N. documento di storno"
            value={row?.numeroDocumentoStorno||""}
            placeholder={"Max. 200 caratteri alfanumerici"}
            // rosso se il valore non è valido (solo alfanumerici, max 200 caratteri)
            error={!isValidNumeroDocumentoStorno(row?.numeroDocumentoStorno ?? "")}
            onChange={(e) => setNumeroDocStorno(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.preventDefault();
            }}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 100,
              bgcolor: 'background.paper',
              borderRadius: 1,
              zIndex: focused ? 10 : 1,
              boxShadow: focused ? 3 : 0,
              '& .MuiInputLabel-root': { fontSize: 10 },
              '& .MuiInputBase-root': { fontSize: 10 },
            }}
          />
        </Box>

      );
    } 
  },
  {
    key:"nota-component",
    label:"Nota",
    component:(setNota, value,row) =>  {

      const [focused, setFocused] = useState(false);
      return (
        <Box sx={{ position: 'relative', width: 130, height: 40, ml: 'auto' }}>
          <TextField
            multiline
            minRows={1}
            maxRows={focused ? undefined : 1}   // focused: grows with content; otherwise: one line
            size="small"
            label="Nota"
            value={row?.nota||""}
            placeholder="La nota deve contenere almeno 3 parole"
            // rosso se la nota non è valida (almeno 3 parole)
            error={!isValidText2NotaPii(row?.nota ?? "")}
            onChange={(e) => setNota(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.preventDefault();
            }}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 100,
              bgcolor: 'background.paper',
              borderRadius: 1,
              zIndex: focused ? 10 : 1,
              boxShadow: focused ? 3 : 0,
              '& .MuiInputLabel-root': { fontSize: 10 },
              '& .MuiInputBase-root': { fontSize: 10 },
            }}
          />
        </Box>
      );
    }
  } 

];


  