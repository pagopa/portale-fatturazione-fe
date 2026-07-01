import { Chip, IconButton,  Tooltip } from "@mui/material";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { HeaderGridCustom } from "../../components/reusableComponents/grid/gridCustom";

export const subHeaderNameModComTrimestraleENTE: HeaderGridCustom[] = [
  { label: 'Mese/Anno',keyValue:'',align:'center',width:'160px', headerAction:false},
  { label: 'Stato',keyValue:'',align:'center',width:'100px',headerAction:false, headerTooltip:(title,label,color) =>  {
    return ( <Tooltip
      placement="bottom"
      title={label}
    ><span><CheckCircleIcon sx={{ color: color }}/></span></Tooltip> );}},
  { label: 'Inserimento',keyValue:'',align:'center',width:'100px',headerAction:false, headerChip:(title,label,color) => <Chip variant="outlined" label={label} sx={{backgroundColor:color}} /> },
  { label: 'Data inserimento',keyValue:'',align:'center',width:'160px', headerAction:false},
  { label: 'Data chiusura',keyValue:'',align:'center',width:'160px', headerAction:false},
  { label: 'Tot. Digit.',keyValue:'',align:'center',width:'160px', headerAction:false},
  { label: 'Tot. Digit. Int.',keyValue:'',align:'center',width:'160px', headerAction:false},
  { label: 'Tot. AR.',keyValue:'',align:'center',width:'160px', headerAction:false},
  { label: 'Tot. AR. Int.',keyValue:'',align:'center',width:'160px', headerAction:false},
  { label: 'Tot. 890.',keyValue:'',align:'center',width:'160px', headerAction:false},
  { label: 'Tot. Not.',keyValue:'',align:'center',width:'160px', headerAction:false},
  { label: '',keyValue:'',align:'center',width:'60',headerAction:false,
    gridAction:(fun,color,disabled,obj) =>
      <IconButton
        size="medium"
        onClick={() => fun(obj)}
        disabled={disabled}
      > <ArrowForwardIcon sx={{ color: color }}/>
      </IconButton>
  }
];


