import { Checkbox, TableCell, TableRow, Tooltip } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';


const RowWhiteList = ({sliced, apiGet, handleClickOnGrid, element}) => {
   

    return (
        <TableRow key={element.idEnte}>
            <Checkbox disabled checked />
            {
                Object.values(sliced).map((value:any, i:number)=>{
                    const indexContractType =  Object.entries(sliced).findIndex(([key]) => key === 'tipoContratto');
                    // stato per loa switch utilizzato nella page tipologia contratto
                    const cssFirstColum = i === 0 ? {color:'#0D6EFD', fontWeight: 'bold', cursor: 'pointer'} : null;
                    const valueEl = (i === 0 && value?.toString().length > 50) ? value?.toString().slice(0, 50) + '...' : value;
                
                    return (
                        <Tooltip key={Math.random()} title={value}>
                            <TableCell sx={cssFirstColum}>
                                {valueEl}
                            </TableCell>
                        </Tooltip>
                    );
                    
                })
            }
        </TableRow>
    );
};

export  default RowWhiteList;