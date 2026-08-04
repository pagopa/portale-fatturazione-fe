import { Box, IconButton, Tooltip } from "@mui/material";
import { HeaderGridCustom } from "../../components/reusableComponents/grid/gridCustom";
import DeleteIcon from '@mui/icons-material/Delete';
import UpdateIcon from '@mui/icons-material/Update';


const getActionDocumentiEmessiSend = (obj,fun) => {
  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      {(obj.tipologiaFattura !== "ACCONTO" && obj.tipologiaFattura !== "ANTICIPO") ? 
        <Tooltip title={obj.inviata === 0 ? "Posticipa" : null}>
          <span>
            <IconButton
              disabled={(obj.inviata === 0 )? false : true}
              size="medium"
              onClick={() => fun(obj,"posticipa")}
            >
              <UpdateIcon />
            </IconButton>
          </span>
        </Tooltip>
        : <Tooltip title={obj.inviata === 0 ? "Elimina" : null}>
          <span>
            <IconButton
              disabled={(obj.inviata === 0 )? false : true}
              size="medium"
              onClick={() => fun(obj,"annulla eliminazione")}
            >
              <DeleteIcon  />
            </IconButton>
          </span>
        </Tooltip>
      }
    </Box>
  );};

const getChipElaborazione = (row) =>{
  let tooltipObj:any= {label:'Non Inviata',title:'La fattura non è stata inviata'};
  if(row.inviata === 1){
    tooltipObj = {label:'Inviata',title:'La fattura è stata inviata',color:'#B5E2B4'};
  }else if(row.inviata === 2){
    tooltipObj = {label:'Elaborazione',title:'La fattura è in elaborazione',color:'#86E1FD'};
  }else if(row.inviata === 3){
    tooltipObj = {label:'Eliminata',title:'La fattura è stata cancellata',color:'#ef9a9a'};
  }else if(row.inviata === 4){
    tooltipObj = {label:'Posticipata',title:'La fattura è stata posticipata',color:'#FFE5A3'};
  }

  return tooltipObj;
};

const getStatoFattura = (obj) =>{
  return "Emessa";
};


export const headersObjGridDocemessiSend : HeaderGridCustom[] = [
  { label: "", align: "center", width: "30px", keyValue: "collaps", typeColumn: "collaps" },
  { label: "Ragione sociale", align: "center", width: "200px", keyValue: "ragionesociale", typeColumn: "ragionesociale", makeAction: true, applyCss: true },
  { label:"Azioni",align:"center",width:"100px",keyValue: "azione", typeColumn: "action",funToManipulateValue:getActionDocumentiEmessiSend, keyToManipulateData:"azione"},
  { label: "Data Fattura", align: "center", width: "160px", keyValue: "dataFattura", typeColumn: "string" },
  { label: "Elaborazione", align: "center", width: "160px", keyValue: "eleborazione", typeColumn: "chip-tooltip" ,funToManipulateValue:getChipElaborazione, keyToManipulateData:"inviata"},
  { label: "Stato", align: "center", width: "100px", keyValue: "stato", typeColumn: "data-exeption" , funToManipulateValue:getStatoFattura, keyToManipulateData:"stato"},
  { label: "T. Fattura", align: "center", width: "130px", keyValue: "tipologiaFattura", typeColumn: "string" },
  { label: "Ident.", align: "center", width: "100px", keyValue: "identificativo", typeColumn: "string" },
  { label: "Tipo Contratto", align: "center", width: "150px", keyValue: "tipoContratto", typeColumn: "string-tipocontratto" },
  { label: "Tot.", align: "center", width: "100px", keyValue: "totale", typeColumn: "euro-number" },
  { label: "N. Fattura", align: "center", width: "150px", keyValue: "numero", typeColumn: "number" },
  { label: "Tipo Documento", align: "center", width: "150px", keyValue: "tipoDocumento", typeColumn: "string" },
  { label: "Divisa", align: "center", width: "100px", keyValue: "divisa", typeColumn: "string" },
  { label: "M. Pagamento", align: "center", width: "100px", keyValue: "metodoPagamento", typeColumn: "string" },
  { label: "Split", align: "center", width: "100px", keyValue: "split", typeColumn: "boolean" },
  {label:"", align:"center", width:"80px", keyValue:"arrow", typeColumn:"arrow"}
];

export const headersObjGridDocemessiSendCollapse: HeaderGridCustom[] = [
  { label: "Numero Linea", align: "center", width: "100px", keyValue: "numerolinea", typeColumn: "number" },
  { label: "Codice Materiale", align: "center", width: "100px", keyValue: "codiceMateriale", typeColumn: "string" },
  { label: "Imponibile", align: "center", width: "100px", keyValue: "imponibile", typeColumn: "euro-number" },
  { label: "Periodo di riferimento", align: "center", width: "100px", keyValue: "periodoRiferimento", typeColumn: "string" },
  { label: "Periodo di fatturazione", align: "center", width: "100px", keyValue: "periodoFatturazione", typeColumn: "string" },
];

