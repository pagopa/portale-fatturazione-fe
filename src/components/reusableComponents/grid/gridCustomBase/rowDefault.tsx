import { TableRow, TableCell, TableBody } from "@mui/material";
import { Tooltip } from "react-bootstrap";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const DefaultRow = ({handleClickOnGrid,element, sliced, apiGet, nameParameterApi, headerNames}) => {

    // const elToMap = Object.fromEntries(Object.entries(sliced).slice(1, -4));
    //:TODO spostare i colori nel file di configurazione
    let statusColor = "#ffffff";
    if(element.source === "obbligatorio"){
        statusColor = "#5BB0D5";
    }else if(element.source === "archiviato"){
        statusColor =  "#A2ADB8";
    }else if(element.source === "facoltativo"){
        statusColor = "#f7e7bc";
    }
 
    return (
        <TableRow 
            sx={{
                backgroundColor:"#ffffff",
                borderTop:"4px solid #F2F2F2",
                borderBottom: "2px solid #F2F2F2",
                height:"80px"
            }} key={element.id}>
            {
                Object.values(sliced).map((value:string|number|any, i:number)=>{
                    const cssFirstColum = i === 0 ? {color:'#0D6EFD', fontWeight: 'bold', cursor: 'pointer'} : null;
                    const valueEl = (i === 0 && value?.toString().length > 50) ? value?.toString().slice(0, 50) + '...' : value;
                   
                    if(headerNames[i]?.headerTooltip){
                      
                        return (
                            <TableCell
                                key={i}
                                align={headerNames[i]?.align}>
                                {headerNames[i]?.headerTooltip("",sliced.stato !== "--"?sliced.stato:sliced.source,statusColor)}              
                            </TableCell>
                        );
                    }else if(headerNames[i]?.headerChip){
                      
                        return (
                            <TableCell
                                key={i}
                                align={headerNames[i]?.align}>
                                {headerNames[i]?.headerChip("",sliced.inserimento.inserimento,sliced.inserimento.color)}              
                            </TableCell>
                        );
                    }else{
                     
                        return (
                            <TableCell
                                align={"center"}
                                sx={cssFirstColum} 
                                onClick={()=>{
                                    if(i === 0){
                                        handleClickOnGrid(element);
                                    }            
                                }}
                            >
                                {valueEl}
                            </TableCell>
                        );
                    }
                    
                })
            }
            {apiGet && <TableCell align="center" onClick={()=>{handleClickOnGrid(element);}}>
                <ArrowForwardIcon sx={{ color: '#1976D2', cursor: 'pointer' }} /> 
            </TableCell> }
        </TableRow>
    );
      

   
};


export default DefaultRow; 
/*
 */