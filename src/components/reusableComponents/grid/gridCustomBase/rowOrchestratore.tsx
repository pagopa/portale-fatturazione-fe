import { TableCell, TableRow, Tooltip } from "@mui/material";
import CircleIcon from '@mui/icons-material/Circle';

const RowOrchestratore = ({sliced, handleClickOnGrid, element,headerNames}) => {

    return (
        <TableRow key={Math.random()}>
            {
                Object.values(sliced).map((value:any, i:number)=>{
                    const indexEsec =  Object.entries(sliced).findIndex(([key]) => key === 'esecuzione');
                   
                    if(i === indexEsec){
                        let color = "#F2F2F2";
                        let titleTooltip = 'Programmato';
                        if(value === '1'){
                            titleTooltip = "Eseguito";
                            color = "green";
                        }else if(value === '2'){
                            titleTooltip = "Eseguito no data";
                            color = "orange";
                        }else if(value === '3'){
                            titleTooltip = "Errore";
                            color = "red";
                        }
                        return(
                            <Tooltip key={Math.random()} title={titleTooltip}>
                                <TableCell
                                    align={headerNames[i]?.align}>
                                    <CircleIcon sx={{color:color}}/>
                                </TableCell>
                            </Tooltip>
                        );
                    }else{
                        return (
                            <Tooltip key={Math.random()} title={value}>
                                <TableCell
                                    align={headerNames[i]?.align}
                                    onClick={()=>{
                                        if(i === 0){
                                            handleClickOnGrid(element);
                                        }            
                                    }}
                                >
                                    {value}
                                </TableCell>
                            </Tooltip>
                        );
                    }
                 
                })
            }
        </TableRow>
    );
};

export default RowOrchestratore;