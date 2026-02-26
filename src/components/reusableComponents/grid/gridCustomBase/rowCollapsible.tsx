import * as React from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Fragment, useState } from 'react';
import { FattureObj, HeaderCollapsible } from '../../../../types/typeFatturazione';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';



interface GridCollapsible{
    data:FattureObj[],
    showedData:FattureObj[],
    setShowedData:any,
    headerNames:HeaderCollapsible[],
    infoPagination:{
        setRowsPerPage:React.Dispatch<React.SetStateAction<number>>,
        setPage:React.Dispatch<React.SetStateAction<number>>,
        page:number,
        rowsPerPage:number,
        count:number
    },
    headerNamesCollapse:HeaderCollapsible[]
}


const RowCollapsible = ({sliced,element ,headerNames, headerNamesCollapse, apiGet}) => {
    const [open, setOpen] = useState(false);
 
    return(
        <Fragment key={element.id}>
            <TableRow key={`tableRow-${element.id}-${element.idFattura}`} sx={{
                height: '80px',
                borderTop: '4px solid #F2F2F2',
                borderBottom: '2px solid #F2F2F2',
                '&:hover': {
                    backgroundColor: '#EDEFF1',
                },
            }}>
            
                {
                    Object.values(sliced)?.map((value:any, i:number)=>{
                        const cssFirstColum = i === 1 ? {color:'#0D6EFD', fontWeight: 'bold', cursor: 'pointer'} : null;
                        //const valueEl = (i === 0 && value?.toString().length > 20) ? value?.toString().slice(0, 20) + '...' : value;
                        if(i === 0){
                            return(
                                <TableCell key={`expand-${element.id}-${i}`} align={"center"}>
                                    <IconButton
                                        sx={{color:'#227AFC'}}
                                        aria-label="expand row"
                                        size="small"
                                        onClick={() => setOpen(!open)}
                                    >
                                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                    </IconButton>
                                </TableCell>
                            );
                        }else if(value === "arrowDetails"){
                            return (
                                <TableCell key={`expand-${element.id}-${i}`} align="center" onClick={()=>{apiGet(element);}}>
                                    <ArrowForwardIcon sx={{ color: '#1976D2', cursor: 'pointer' }} /> 
                                </TableCell> 
                            );
                        }else{
                            return (
                                <TableCell key={`expand-${element.id}-${i}`}  onClick={()=>{i === 1 && apiGet(element);}} sx={cssFirstColum}  align={"center"}>{value}</TableCell>
                            );
                        }             
                    })
                }
           
            </TableRow>
            <TableRow key={`tableRow-position-${element.id}`} >
                <TableCell style={{ paddingBottom: 0, paddingTop: 0}} colSpan={7}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2 , backgroundColor:'#F8F8F8', padding:'10px'}}>
                            <Typography sx={{marginLeft:"6px"}} variant="h6" gutterBottom component="div">
                Posizioni
                            </Typography>
                            <Table size="small" aria-label="purchases">
                                <TableHead>
                                    <TableRow sx={{borderColor:"white",borderWidth:"thick"}}>
                                        {
                                            Object.values(headerNamesCollapse)?.map((value:any, i:number)=>{
                                                return (
                                                    <TableCell key={`position-${value.label}-${i}`} align='center'>{value.label}</TableCell>
                                                );
                                            })
                                        }
                                    
                                    </TableRow>
                                </TableHead>
                                <TableBody sx={{borderColor:"white",borderWidth:"thick"}}>
                                    {element?.posizioni?.map((obj,i) => (
                                        <TableRow key={`position-row-${i}`}>
                                            {
                                                Object.values(obj)?.map((value:any, i:number)=>{
                                                    return (
                                                        <TableCell key={`position-value-${value}-${i}`} align='center' >{value}</TableCell>
                                                    );
                                                })
                                            } 
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow> 
        </Fragment> 

    );
   
   
   
};

export default RowCollapsible;
    
    
    
/*
      <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{backgroundColor:'#F8F8F8', padding:'10px'}}>
                            <Typography sx={{marginLeft:"6px"}} variant="h6" gutterBottom component="div">
                Posizioni
                            </Typography>
                            <Table size="small" aria-label="purchases">
                                <TableHead>
                                    <TableRow sx={{borderColor:"white",borderWidth:"thick"}}>
                                        <TableCell sx={{ marginLeft:"16px"}} >Numero Linea</TableCell>
                                        <TableCell sx={{ marginLeft:"16px"}}>Codice Materiale</TableCell>
                                        <TableCell sx={{ marginLeft:"16px"}}>Imponibile</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody sx={{borderColor:"white",borderWidth:"thick"}}>
                                    {element?.posizioni?.map((obj) => (
                                        <TableRow key={Math.random()}>
                                            <TableCell>
                                                {obj.numerolinea}
                                            </TableCell>
                                            <TableCell>{obj.codiceMateriale}</TableCell>
                                            <TableCell align="right" component="th" scope="row">
                                                {obj.imponibile.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow> 
     */
    

    