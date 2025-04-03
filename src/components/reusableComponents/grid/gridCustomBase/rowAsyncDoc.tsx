import { TableCell, TableRow, Tooltip, Typography } from "@mui/material";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { boolean } from "yup";

const RowAsyncDoc = ({sliced,headerNames}) => {
    console.log({headerNames});

    const prova = () => {
        console.log('download');
    };
    return (
        <TableRow sx={{
            borderTop:"4px solid #F2F2F2",
            borderBottom: "2px solid #F2F2F2"
        }} 
        key={Math.random()}>
            { Object.values(sliced).map((value:any, i:number)=>{
                const indexLetto =  Object.entries(sliced).findIndex(([key]) => key === 'letto');
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
                console.log({xx:headerNames[i]?.headerTooltip,pp:headerNames[i]?.gridAction,value});
                if(value === "--" || typeof(value) === "boolean"){
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
                            {headerNames[i]?.headerTooltip(titleTooltip === 0 ? "In Elaborazione" : "Elaborato",customValue=== 0 ? "In Elaborazione" : "Elaborato","info")}              
                        </TableCell>
                    );
                }else if(headerNames[i]?.gridAction){
                    return (
                        <TableCell
                            align={headerNames[i]?.align}>
                            {headerNames[i]?.gridAction(prova,"primary")}                
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