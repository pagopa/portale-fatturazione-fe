import { Chip, IconButton, Tooltip } from "@mui/material";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { HeaderGridCustom } from "../../components/reusableComponents/grid/gridCustom";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { statiContestazione, tipoNotificaArray } from "../../reusableFunction/reusableArrayObj";


const getChipStato = (el) => {
  let chipBgColor = "#E3E7EB";
    
  if(el.descrizioneStato === "Presa in carico"){
    chipBgColor = "#86E1FD";
  }else if(el.descrizioneStato === "Elaborato"){
    chipBgColor = "#B5E2B4";
  }else if(el.descrizioneStato === "Elaborato no data"){
    chipBgColor ="#FFE5A3";
  }else if(el.descrizioneStato === "Errore"){
    chipBgColor = "#FB9EAC";
  }
  return (
    
    <Chip variant="outlined" label={el.descrizioneStato} sx={{backgroundColor:chipBgColor}} />
  );
};

const getDownloadAction = (el,fun) => {
  return(
    <IconButton
      size="medium"
      onClick={() => fun(el)}
      disabled={el.descrizioneStato !== "Elaborato"}
    > <FileDownloadIcon />
    </IconButton>
  );
};

const getIconLettura = (el) => {

  let color = "green";
  let titleTooltip = "Letto";
  if(!el.letto){
    titleTooltip = "Non letto";
    color = "#d9d9d9";
  }
  return (
    <Tooltip title={titleTooltip}>
      <span>
        <CheckCircleOutlineIcon sx={{color:color}}/>
      </span>
    </Tooltip> 
    
  );
};


export const headerNameAsyncDoc: HeaderGridCustom[] = [
  { label: "", align: "center", width: "30px", keyValue: "collaps", typeColumn: "collaps" },
  { label: 'Data Richiesta', keyValue:'dataInserimento', typeColumn:"data-ora",align:'center',width:'160px', headerAction:true, },
  { label: 'Anno',align:'center',width:'100px',headerAction:false,keyValue:'anno',typeColumn:"string" },
  { label: 'Mese',align:'center',width:'100px',headerAction:false,keyValue:'mese' ,typeColumn:"mese-number"},
  { label: 'Tot. Not.',align:'center',width:'80px',headerAction:false,keyValue:'count',typeColumn:"number" },
  { label: 'Data Esecuzione',align:'center',width:'150px',headerAction:false,keyValue:'dataFine',typeColumn:"data-ora" },
  { label: 'Stato',align:'center',width:'100px',headerAction:false,keyValue:'custom-value',typeColumn:"custom-value",funToManipulateValue:getChipStato },
  { label: 'Letto',align:'center',width:'30px',headerAction:false,keyValue:'custom-value',typeColumn:"custom-value",funToManipulateValue:getIconLettura },
  { label: '',align:'center',width:'60',headerAction:false,keyValue:'custom-value',typeColumn:"custom-value",funToManipulateValue:getDownloadAction}
];

const getStatoContestazione = (el) => {
  return el.statoContestazione?.map(el => statiContestazione[el]).join(' , ')||"--";
};

const getTipoNotifica = (el) => {
  return tipoNotificaArray[el.tipoNotifica-1]||"--";
};

export const headerNameAsyncDocCollapse : HeaderGridCustom[] = [
  { label: "Anno", align: "center", width: "100px", keyValue: "anno", typeColumn: "string" },
  { label: "Mese", align: "center", width: "100px", keyValue: "mese", typeColumn: "mese-number" },
  { label: "Tipo Notifica", align: "center", width: "100px", keyValue: "custom-value", typeColumn: "custom-value",funToManipulateValue:getTipoNotifica },
  { label: "CAP", align: "center", width: "100px", keyValue: "cap", typeColumn: "string" },
  { label: "IUN", align: "center", width: "100px", keyValue: "iun", typeColumn: "string" }, 
  { label: "Stato Contestazione", align: "center", width: "100px", keyValue: "custom-value", typeColumn: "custom-value",funToManipulateValue:getStatoContestazione }, 
];
