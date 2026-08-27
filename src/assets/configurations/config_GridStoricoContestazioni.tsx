import { HeaderGridCustom } from "../../components/reusableComponents/grid/gridCustom";
import { getColorChipContestazioneStorico } from "../../reusableFunction/function";

export const headersName: HeaderGridCustom[] = [
  { label: 'Ragione Sociale',align:'left',width:'180px', headerAction:false,keyValue:'ragioneSociale',typeColumn:"ragionesociale",makeAction:true,applyCss:true},
  {label:  'Data Inserimento',align:'center',width:'200px',headerAction:false,keyValue:'dataInserimento',typeColumn:"data-ora"},
  { label: 'Mese',align:'center',width:'150px',headerAction:false,keyValue:'mese',typeColumn:"mese-number"},
  { label: "Anno",align:'center',width:'150px',headerAction:false,keyValue:'anno',typeColumn:"string"},
  { label: 'Stato',align:'center',width:'200px',headerAction:false,keyValue:'descrizioneStato',typeColumn:'chip',funToManipulateValue:getColorChipContestazioneStorico, keyToManipulateData:"stato"},
  { label: 'Categoria Doc.',align:'center',width:'250px',headerAction:false,keyValue:'categoriaDocumento',typeColumn:"string"},
  { label: '',align:'center',width:'80px',headerAction:false,keyValue:'arrow',typeColumn:'arrow'}
];
