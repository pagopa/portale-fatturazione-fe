import { IconButton } from "@mui/material";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { ItemGridPrevisonale } from "../../page/prod_pn/listaModuloComPrevisonale";

interface HeaderPrevisionale {
    label:string,
    align:string,
    width:number|string,
    headerAction:boolean| ((row: any) => void),
    chip?:boolean,
    gridAction?:(color:string,disabled:boolean,el:ItemGridPrevisonale) => JSX.Element,
    rowAction?:(el:ItemGridPrevisonale) => void
}

export const headersGridPrevisionale = (fun): HeaderPrevisionale[] => {
    return [
        { label: 'Ragione Sociale',align:'center',width:'160px',headerAction:false, rowAction:(el) => fun(el)},
        { label: 'Mese',align:'center',width:'100px',headerAction:false},
        { label: 'Stato',align:'center',width:'100px',headerAction:false,chip:true},
        { label: 'Tipo Contratto',align:'center',width:'150px',headerAction:false},
        { label: 'Data Contratto',align:'center',width:'150px',headerAction:false},
        { label: 'Data Inserimento',align:'center',width:'130px',headerAction:false},
        { label: 'Data Chiusura',align:'center',width:'130px',headerAction:false},
        { label: 'Tot. Dig. Naz.',align:'center',width:'130px',headerAction:false},
        { label: 'Tot. Dig. Int.',align:'center',width:'130px',headerAction:false},
        { label: 'Tot. Analog. AR. Naz.',align:'center',width:'130px',headerAction:false},
        { label: 'Tot. Analog. AR. Int.',align:'center',width:'130px',headerAction:false},
        { label: 'Tot. Analog. 890 Naz.',align:'center',width:'130px',headerAction:false},
        { label: 'Tot. Not.',align:'center',width:'130px',headerAction:false},
        { 
            label: '',
            align:'center',
            width:'60px',
            headerAction:false,
            gridAction: ( color, disabled,el) => (
                <IconButton
                    size="medium"
                    onClick={() => fun(el)}
                    disabled={disabled}
                >
                    <ArrowForwardIcon sx={{ color }} />
                </IconButton>
            )
        }
    ];
};
   