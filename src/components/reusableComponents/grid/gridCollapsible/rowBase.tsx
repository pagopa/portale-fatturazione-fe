import { Box, Collapse, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import { useState } from "react";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DownloadIcon from '@mui/icons-material/Download';


const RowBase = ({row, setSelected,selected}) => {
    const [open, setOpen] = useState(false);
   
  
    /*  const handleClick = ( id: number) => {
        //logica per id
        const selectedIndex = selected.indexOf(id);
        let newSelected: readonly number[] = [];
        
        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }
        setSelected(newSelected);
       
        
    };

    const isSelected = (id: number) => selected.indexOf(id) !== -1;

    let tooltipObj:any= {label:'Non Inviata',title:'La fattura non è stata inviata'};
    if(row.inviata === 1){
        tooltipObj = {label:'Inviata',title:'La fattura è stata inviata',color:'success'};
    }else if(row.inviata === 2){
        tooltipObj = {label:'Elaborazione',title:'La fattura è in elaborazione',color:'warning'};
    }else if(row.inviata === 3){
        tooltipObj = {label:'Cancellata',title:'La fattura è stata cancellata',color:'info'};
    }*/
 
    return(
        
        <TableBody sx={{minHeight:"100px"}}>
            <TableRow  sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton
                        sx={{color:'#227AFC'}}
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell sx={{color:'#0D6EFD',fontWeight: 'bold'}} >{ row.name?.length > 50 ? row.name.slice(0, 50) + '...' : row.name}</TableCell>
                <TableCell align='center'>{row.contractId}</TableCell>
                <TableCell align='center' >{row.yearQuarter}</TableCell>
                <TableCell align='center' >{row.bollo}</TableCell>
                <TableCell align='center'>{row.riferimentoData !== null ? new Date(row.riferimentoData).toLocaleString().split(',')[0] : ''}</TableCell>
                <TableCell align='center' onClick={()=>{
                    console.log('click on arrow');           
                } }>
                    <Tooltip title="Download report">
                        <IconButton>
                            <DownloadIcon sx={{ color: '#1976D2'}} /> 
                        </IconButton>
                    </Tooltip>
                    
                </TableCell>
                <TableCell align='center' onClick={()=>{
                    console.log('click on arrow');           
                } }>
                    <Tooltip title="Download trimestre">
                        <IconButton>
                            <DownloadIcon sx={{ color: '#1976D2'}} /> 
                        </IconButton>
                    </Tooltip>
                </TableCell>
            </TableRow>
            <TableRow >
                <TableCell style={{ paddingBottom: 0, paddingTop: 0}} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2 , backgroundColor:'#F8F8F8', padding:'10px'}}>
                            <Typography sx={{marginLeft:"6px"}} variant="h6" gutterBottom component="div">
                Posizioni
                            </Typography>
                            <Table size="small" aria-label="purchases">
                                <TableHead>
                                    <TableRow sx={{borderColor:"white",borderWidth:"thick"}}>
                                        <TableCell sx={{ marginLeft:"16px"}} >Codice Articolo</TableCell>
                                        <TableCell sx={{ marginLeft:"16px"}} >ID Categoria</TableCell>
                                        <TableCell sx={{ marginLeft:"16px"}}>Quantità</TableCell>
                                        <TableCell align="center" sx={{ marginLeft:"16px"}}>Importo</TableCell>
                                        <TableCell sx={{ marginLeft:"16px"}}>Codice IVA</TableCell>
                                        <TableCell sx={{ marginLeft:"16px"}}>Condizioni</TableCell>
                                        <TableCell sx={{ marginLeft:"16px"}}>Causale</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody sx={{borderColor:"white",borderWidth:"thick"}}>
                                    {row?.posizioni?.map((obj) => (
                                        <TableRow key={obj.progressivoRiga}>
                                            <TableCell>{obj.codiceArticolo}</TableCell>
                                            <TableCell>{obj.category}</TableCell>
                                            <TableCell>{obj.quantita}</TableCell>
                                            <TableCell align="right" component="th" scope="row">{obj.importo.toLocaleString("de-DE", { style: "currency", currency: "EUR",maximumFractionDigits: 14 })}</TableCell>
                                            <TableCell>{obj.codIva}</TableCell>
                                            <TableCell>{obj.condizioni}</TableCell>
                                            <TableCell>{obj.causale}</TableCell>  
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow> 
        </TableBody>);
   
   
   
};

export default RowBase;