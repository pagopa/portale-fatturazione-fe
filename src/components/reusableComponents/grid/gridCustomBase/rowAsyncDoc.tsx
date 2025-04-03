import { TableCell, TableRow, Tooltip, Typography } from "@mui/material";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const RowAsyncDoc = ({sliced,headerNames}) => {
 
    return (
        <TableRow sx={{
            borderTop:"4px solid #F2F2F2",
            borderBottom: "2px solid #F2F2F2"
        }} 
        key={Math.random()}>
            { Object.values(sliced).map((value:any, i:number)=>{
                const indexLetto =  Object.entries(sliced).findIndex(([key]) => key === 'letto');
                const indexStato =  Object.entries(sliced).findIndex(([key]) => key === 'stato');
                let titleTooltip = value;
                let customValue = value;
                if(i === indexLetto){
                    let color = "green";
                    titleTooltip = "Letto";
                    if(!value){
                        titleTooltip = "Non letto";
                        color = "#d9d9d9";
                    }
                    customValue = <CheckCircleOutlineIcon sx={{color:color}}/>;
                }
                console.log({xx:headerNames[i]?.headerTooltip});
                if(value === "--"){
                    return (
                        <TableCell
                            align={headerNames[i]?.align}>
                            {customValue} 
                        </TableCell>
                    );
                }else if(headerNames[i]?.headerTooltip){
                    return (
                        <TableCell
                            align={headerNames[i]?.align}>
                            {headerNames[i]?.headerTooltip(titleTooltip === 0 ? "In Elaborazione" : "Elebaorato",customValue=== 0 ? "In Elaborazione" : "Elebaorato","info")}
                            <Typography style={{ fontSize: "1rem", fontWeight: 600 }} variant="caption-semibold"></Typography> 
                                        
                        </TableCell>
                    );
                }else{
                    return (
                        <Tooltip key={Math.random()} title={titleTooltip}  placement="right">
                            <TableCell
                                align={headerNames[i]?.align}>
                                <Typography style={{ fontSize: "1rem", fontWeight: 600 }} variant="caption-semibold">{customValue}</Typography> 
                                        
                            </TableCell>
                        </Tooltip>
                    );
                }
            })
            }
        </TableRow>
    );
};

export default RowAsyncDoc;