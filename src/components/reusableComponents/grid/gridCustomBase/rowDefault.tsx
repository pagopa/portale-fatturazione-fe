import { TableRow, TableCell, TableBody } from "@mui/material";
import { Tooltip } from "react-bootstrap";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const DefaultRow = ({handleClickOnGrid,element, sliced, apiGet, nameParameterApi, headerNames}) => {

    const elToMap = Object.fromEntries(Object.entries(sliced).slice(1, -4));
   
    let statusColor = "#ffffff";
    if(element.source === "obbligatorio" && element.totale === null){
        statusColor = "#FB9EAC";
    }else if(element.source === "obbligatorio" && element.totale !== null){
        statusColor = "#f7e7bc";
    }else if(element.source === "archiviato"){
        statusColor = "#B5E2B4";
    }else if(element.source === "facoltativo" && element.stato === "Aperta/Caricato"){
        statusColor = "#f7e7bc";
    }else if(element.source === "facoltativo"){
        statusColor = "#F2F2F2";
    }

    console.log(element);
    return (
        <TableRow 
            sx={{
                backgroundColor:"#ffffff",
                borderTop:"4px solid #F2F2F2",
                borderBottom: "2px solid #F2F2F2",
                height:"80px"
            }} key={element.id}>
            {
                Object.values(elToMap).map((value:string|number|any, i:number)=>{
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