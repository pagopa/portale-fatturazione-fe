import { Button, IconButton, TableCell, TableRow, Tooltip } from "@mui/material";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const RowContestazioni = ({sliced,handleClickOnGrid,apiGet,element}) => {

    console.log({sliced,element});
    return (
        <TableRow key={Math.random()}>
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
                                {valueEl}
                            </TableCell>
                        </Tooltip>
                    );
                })
            }
            {apiGet &&  <TableCell align="center"><IconButton onClick={()=>{handleClickOnGrid(element);}} ><ArrowForwardIcon sx={{ color: '#1976D2', cursor: 'pointer' }} /></IconButton></TableCell> }
        </TableRow>
    );
};

export default RowContestazioni;