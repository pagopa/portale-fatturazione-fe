import { Button, IconButton, TableCell, TableRow, Tooltip, Typography } from "@mui/material";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const RowContestazioni = ({sliced,handleClickOnGrid,apiGet,element,headerNames}) => {

    let bgColorRow = "#F0F8FF"; 
    if(element.idStato === 3){
        bgColorRow = "#F0FFF0";
    }else if(element.idStato === 2){
        bgColorRow = "#FFF0F5";
    }

    
    return (
        <TableRow key={Math.random()}
            sx={{
                height: '80px',
                borderTop: '4px solid #F2F2F2',
                borderBottom: '2px solid #F2F2F2',
                '&:hover': {
                    backgroundColor: '#EDEFF1',
                },
            }}>
            {
                Object.values(sliced)?.map((value:any, i:number)=>{
                    const cssFirstColum = i === 0 ? {color:'#0D6EFD', fontWeight: 'bold', cursor: 'pointer'} : null;
                    const valueEl = (i === 0 && value?.toString().length > 20) ? value?.toString().slice(0, 20) + '...' : value;
                    if(headerNames[i]?.renderCell){
                        return  headerNames[i]?.renderCell(valueEl,bgColorRow);
                       
                    }else{
                        return (
                            <Tooltip key={Math.random()} title={(value?.length > 20 && i === 0) ? value: null}>
                                <TableCell
                                    sx={cssFirstColum} 
                                    align={i !== 0 ? "center": "left"}
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
                    }
                   
                })
            }
            {apiGet &&  <TableCell align="center"><IconButton onClick={()=>{handleClickOnGrid(element);}} ><ArrowForwardIcon fontSize="small" sx={{ color: '#1976D2', cursor: 'pointer' }} /></IconButton></TableCell> }
        </TableRow>
    );
};

export default RowContestazioni;