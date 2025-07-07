import { TableRow, TableCell, TableBody } from "@mui/material";
import { Tooltip } from "react-bootstrap";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const DefaultRow = ({handleClickOnGrid,element, sliced, apiGet, nameParameterApi}) => {

    console.log("DENTRO ELLELELE",{sliced,element});
    const elToMap = Object.fromEntries(Object.entries(element).slice(1, -1));
    return (
        <TableRow 
            sx={{
                backgroundColor:"#ffffff",
                borderTop:"4px solid #F2F2F2",
                borderBottom: "2px solid #F2F2F2"
            }} key={element.id}>
            {
                Object.values(elToMap).map((value:string|number|any, i:number)=>{
                    const cssFirstColum = i === 0 ? {color:'#0D6EFD', fontWeight: 'bold', cursor: 'pointer'} : null;
                    const valueEl = (i === 0 && value?.toString().length > 50) ? value?.toString().slice(0, 50) + '...' : value;
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