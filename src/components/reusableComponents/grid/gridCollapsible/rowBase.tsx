import { Box, Collapse, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import { useState } from "react";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from "react-router";
import { PathPf } from "../../../../types/enum";



const RowBase = ({row,handleModifyMainState}) => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
   

    const handleOnDetail = (row) => {  
        handleModifyMainState({docContabileSelected:{key:row.key}}); 
        navigate(PathPf.DETTAGLIO_DOC_CONTABILE);
    };
 
    return(
        
        <TableBody sx={{minHeight:"100px"}}>
            <TableRow  sx={{
                height: '80px',
                borderTop: '4px solid #F2F2F2',
                borderBottom: '2px solid #F2F2F2',
                '&:hover': {
                    backgroundColor: '#EDEFF1',
                },
                '& > *': { borderBottom: 'unset' }
            }}>
                <TableCell>
                   
                    <IconButton
                        sx={{color:'#227AFC'}}
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                   
                </TableCell>
                <Tooltip title={row.name?.length > 20 ? row.name : null}>
                    <TableCell sx={{color:'#0D6EFD',fontWeight: 'bold',cursor:'pointer',width:'200px'}} onClick={()=> handleOnDetail(row)}  >{ row.name?.length > 20 ? row.name.slice(0, 20) + '...' : row.name}</TableCell>
                </Tooltip>
                <TableCell align='center'>{row.contractId||"--"}</TableCell>
                <TableCell align='center' >{row.numero||"--"}</TableCell>
                <TableCell align='center' >{row.yearQuarter||"--"}</TableCell>
                <TableCell align='center'>{new Date(row.data).toLocaleString().split(',')[0]||"--"}</TableCell>
                <TableCell align='center' onClick={()=> handleOnDetail(row)}>
                    <Tooltip title="Dettaglio">
                        <IconButton>
                            <ArrowForwardIcon sx={{ color: '#1976D2'}} /> 
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
                            <Table size="small">
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
                                            <TableCell>{obj.codiceArticolo === null ?"--":obj.codiceArticolo}</TableCell>
                                            <TableCell>{obj.category === null ?"--":obj.category}</TableCell>
                                            <TableCell>{obj.quantita === null ?"--":obj.quantita}</TableCell>
                                            <TableCell align="right" component="th" scope="row">{obj.importo.toLocaleString("de-DE", {style: "currency", currency: "EUR",maximumFractionDigits: 14 })}</TableCell>
                                            <TableCell>{obj.codIva === null ?"--":obj.codIva}</TableCell>
                                            <TableCell>{obj.condizioni === null ?"--":obj.condizioni}</TableCell>
                                            <TableCell>{obj.causale === null ?"--":obj.causale}</TableCell>  
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