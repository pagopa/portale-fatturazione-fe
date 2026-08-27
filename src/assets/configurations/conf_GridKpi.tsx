import { IconButton, Tooltip } from "@mui/material";
import { HeaderGridCustom } from "../../components/reusableComponents/grid/gridCustom";
import LinkIcon from '@mui/icons-material/Link';


const downloadFile = (obj,fun) => {
  const disableIcon = obj.link === '' || obj.link === null;
  return (
    <Tooltip disableHoverListener={disableIcon} title="Download csv">
      <span>
        <IconButton onClick={() => fun && fun(obj?.url, obj?.name)} disabled={disableIcon}>
          <LinkIcon sx={disableIcon ?{color:'grey'} :{ color: '#1976D2'}}  /> 
        </IconButton>
      </span>
    </Tooltip>
  );
};

export const headersKpi : HeaderGridCustom[] = [
  { label: "", align: "center", width: "30px", keyValue: "collaps", typeColumn: "collaps" },
  { label: "Nome KPI", align: "center", width: "200px", keyValue: "name", typeColumn: "ragionesociale", makeAction: true, applyCss: true },
  { label: "Trimestre", align: "center", width: "100px", keyValue: "yearQuarter", typeColumn: "string" },
  { label: "Recipient ID", align: "center", width: "120px", keyValue: "recipientId", typeColumn: "string"},
  { label: "Totale", align: "center", width: "120px", keyValue: "totale", typeColumn: "euro" },
  { label: "Totale sconto", align: "center", width: "100px", keyValue: "totaleSconto", typeColumn: "euro" },
  { label: "Lista KPI", align: "center", width: "100px", keyValue: "kpiList", typeColumn: "string" },
  { label: '', align: 'center', width: '100px', keyValue: "azione", typeColumn: "action" ,funToManipulateValue:downloadFile}
];

export const headersKpiCollapse: HeaderGridCustom[] = [
  { label: "ID PSP", align: "center", width: "100px", keyValue: "pspId", typeColumn: "number" },
  { label: "Totale Transazioni", align: "center", width: "100px", keyValue: "trxTotal", typeColumn: "string" },
  { label: "Totale", align: "center", width: "100px", keyValue: "valueTotal", typeColumn: "number" },
  { label: "KPI ok", align: "center", width: "100px", keyValue: "kpiOk", typeColumn: "number" },
  { label: "Percentuale Sconto", align: "center", width: "100px", keyValue: "percSconto", typeColumn: "string" },
  { label: "Sconto", align: "center", width: "100px", keyValue: "valueDiscount", typeColumn: "euro" },
 
];
