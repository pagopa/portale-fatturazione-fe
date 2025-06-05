import { Button, IconButton, TableCell, TableRow, Tooltip, Typography } from "@mui/material";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const RowContestazioni = ({sliced,handleClickOnGrid,apiGet,element}) => {

    let bgColorRow = "#F0F8FF"; 
    if(element.idStato === 99){
        bgColorRow = "#F0FFF0";
    }else if(element.idStato === 1 || element.idStato === 100 || element.idStato === 101  ){
        bgColorRow = "#FFF0F5";
    }

    console.log({sliced,element});
    return (
        <TableRow key={Math.random()}
            sx={{
                backgroundColor:bgColorRow,
                borderTop:"4px solid #F2F2F2",
                borderBottom: "2px solid #F2F2F2"
            }}>
            {
                Object.values(sliced)?.map((value:any, i:number)=>{
                    const cssFirstColum = i === 0 ? {color:'#0D6EFD', fontWeight: 'bold', cursor: 'pointer'} : null;
                    const valueEl = (i === 0 && value?.toString().length > 50) ? value?.toString().slice(0, 50) + '...' : value;
                    return (
                        <Tooltip key={Math.random()} title={value}>
                            <TableCell
                                sx={cssFirstColum} 
                                onClick={()=>{
                                    if(i === 0){
                                        handleClickOnGrid(element);
                                    }            
                                }}
                            >
                                <Typography style={{ fontSize: "1rem", fontWeight: 600 }} variant="caption-semibold"> {valueEl}</Typography> 
                               
                            </TableCell>
                        </Tooltip>
                    );
                })
            }
            {apiGet &&  <TableCell align="center"><IconButton onClick={()=>{handleClickOnGrid(element);}} ><ArrowForwardIcon fontSize="small" sx={{ color: '#1976D2', cursor: 'pointer' }} /></IconButton></TableCell> }
        </TableRow>
    );
};

export default RowContestazioni;