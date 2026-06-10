import { Chip, IconButton,  Tooltip } from "@mui/material";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { HeaderGridCustom } from "../../components/reusableComponents/grid/gridCustom";

export const subHeaderNameModComTrimestraleENTE: HeaderGridCustom[] = [
  { label: 'Mese/Anno',align:'center',width:'160px', headerAction:false},
  { label: 'Stato',align:'center',width:'100px',headerAction:false, headerTooltip:(title,label,color) =>  {
    return ( <Tooltip
      placement="bottom"
      title={label}
    ><span><CheckCircleIcon sx={{ color: color }}/></span></Tooltip> );}},
  { label: 'Inserimento',align:'center',width:'100px',headerAction:false, headerChip:(title,label,color) => <Chip variant="outlined" label={label} sx={{backgroundColor:color}} /> },
  { label: 'Data inserimento',align:'center',width:'160px', headerAction:false},
  { label: 'Data chiusura',align:'center',width:'160px', headerAction:false},
  { label: 'Tot. Digit.',align:'center',width:'160px', headerAction:false},
  { label: 'Tot. Digit. Int.',align:'center',width:'160px', headerAction:false},
  { label: 'Tot. AR.',align:'center',width:'160px', headerAction:false},
  { label: 'Tot. AR. Int.',align:'center',width:'160px', headerAction:false},
  { label: 'Tot. 890.',align:'center',width:'160px', headerAction:false},
  { label: 'Tot. Not.',align:'center',width:'160px', headerAction:false},
  { label: '',align:'center',width:'60',headerAction:false,
    gridAction:(fun,color,disabled,obj) =>
      <IconButton
        size="medium"
        onClick={() => fun(obj)}
        disabled={disabled}
      > <ArrowForwardIcon sx={{ color: color }}/>
      </IconButton>
  }
];


