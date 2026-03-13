import { TableCell, TableRow, Tooltip, Typography } from "@mui/material";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InfoIcon from '@mui/icons-material/Info';
import DangerousIcon from '@mui/icons-material/Dangerous';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const RowOrchestratore = ({sliced,headerNames,element}) => {
    let bgColorRow = "#F0F8FF";
    if(sliced.esecuzione === 1){
        bgColorRow = "#F0FFF0";
    }else if(sliced.esecuzione === 2){
        bgColorRow ="#FFFAF0";
    }else if(sliced.esecuzione === 3){
        bgColorRow = "#FFF0F5";
    }
 
    return (
        <TableRow key={`${element.idOrchestratore}-${element.mese}-${element.tipologia}`} sx={{
            backgroundColor:bgColorRow,
            borderTop:"4px solid #F2F2F2",
            borderBottom: "2px solid #F2F2F2"
        }} >
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
                    if(i === indexDataEs || i === indexDataCon || i === indexDataFat){
                        customValue = value.split(" ")[0];  
                    }
                    if(customValue !== "--"){
                        return (
                            <Tooltip key={`cell-${element.idOrchestratore}-${i}`} title={titleTooltip} placement="right">
                                <TableCell align={headerNames[i]?.align}>
                                    <Typography style={{ fontSize: "1rem", fontWeight: 600 }} variant="caption-semibold">
                                        {customValue}
                                    </Typography> 
                                </TableCell>
                            </Tooltip>
                        );
                    } else {
                        return (
                            <TableCell key={`cell-${element.idOrchestratore}-${i}`} align={headerNames[i]?.align}>
                                {customValue}
                            </TableCell>
                        );
                    }
                })
            }
        </TableRow>
    );
};

export default RowOrchestratore;