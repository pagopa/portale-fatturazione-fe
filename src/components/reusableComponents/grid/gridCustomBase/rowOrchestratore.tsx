import { TableCell, TableRow, Tooltip } from "@mui/material";
import CircleIcon from '@mui/icons-material/Circle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InfoIcon from '@mui/icons-material/Info';
import DangerousIcon from '@mui/icons-material/Dangerous';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const RowOrchestratore = ({sliced,headerNames}) => {


    return (
        <TableRow key={Math.random()}>
            {
                Object.values(sliced).map((value:any, i:number)=>{
                    const indexEsec =  Object.entries(sliced).findIndex(([key]) => key === 'esecuzione');
                    const indexDataEs =  Object.entries(sliced).findIndex(([key]) => key === 'dataEsecuzione');
                    const indexDataCon =  Object.entries(sliced).findIndex(([key]) => key === 'dataFineContestazioni');
                    const indexDataFat =  Object.entries(sliced).findIndex(([key]) => key === 'dataFatturazione');
                    let color = '';
                    let titleTooltip = value;
                    let customValue = value;
                    
                    if(i === indexEsec){
                        color = "#636363";
                        titleTooltip = 'Programmato';
                        customValue = <AccessTimeIcon sx={{color:color}}/>;
                        if(value === 1){
                            titleTooltip = "Eseguito";
                            color = "green";
                            customValue = <CheckCircleOutlineIcon sx={{color:color}}/>;
                        }else if(value === 2){
                            titleTooltip = "Eseguito no data";
                            color = "orange";
                            customValue = <InfoIcon sx={{color:color}}/>;
                        }else if(value === 3){
                            
                            titleTooltip = "Errore";
                            color = "red";
                            customValue = <DangerousIcon sx={{color:color}}/>;
                        }
                        
                    }
                    if(i === indexDataEs || i === indexDataCon || i === indexDataFat ){
                        customValue = value.split(" ")[0];  
                    }
                    
                    return(
                        <Tooltip key={Math.random()} title={titleTooltip}>
                            <TableCell
                                align={headerNames[i]?.align}>
                                {customValue}
                            </TableCell>
                        </Tooltip>
                    );
                   
                })
            }
        </TableRow>
    );
};

export default RowOrchestratore;