import { Box, Checkbox, Chip, Collapse, IconButton, Skeleton, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { month } from "../../reusableFunction/reusableArrayObj";
import Loader from "../reusableComponents/loader";

interface DetailsSingleRow 
{
    idFattura: number,
    tipologiaFattura: string,
    idEnte: string,
    ragioneSociale: string,
    annoRiferimento: number,
    meseRiferimento: number,
    importo: number,
    dataFattura: string
}


const RowJsonSap = ({row,setSelected,selected,apiDetail,lista}) => {

    
    const [open, setOpen] = useState(false);
    const [detailsSingleRow, setDetailsSingleRow] = useState<DetailsSingleRow[]>([]);

    useEffect(() =>{
        if(open){
            apiDetail({
                annoRiferimento: row.annoRiferimento,
                meseRiferimento: row.meseRiferimento,
                tipologiaFattura:row.tipologiaFattura},
            setDetailsSingleRow);  
        }else{
            setDetailsSingleRow([]);
        }


    },[open]);

    useEffect(()=>{
        setOpen(false);
        setDetailsSingleRow([]);
    },[lista]);
   
  
    const handleClick = ( id: number) => {
        console.log('ciao');
    };

    const isSelected = lista.find(el => (el.annoRiferimento === row.annoRiferimento) );

 
    return(
        
        <TableBody sx={{minHeight:"100px"}}>
            <TableRow  sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell padding="checkbox" sx={{width:'80px'}}>
                    <Checkbox
                        
                        color="primary"
                        indeterminate={false}
                        checked={false}
                        disabled={false}
                        onChange={()=>{
                            setSelected(prev => ([...prev,{ 
                                annoRiferimento: row.annoRiferimento,
                                meseRiferimento: row.meseRiferimento,
                                tipologiaFattura: row.tipologiaFattura}]));
                        }}
                        inputProps={{
                            'aria-label': 'select all desserts',
                        }}
                    />
                </TableCell>
                <TableCell >
                    <IconButton
                        sx={{color:'#227AFC'}}
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell align='center' sx={{color:'#0D6EFD',fontWeight: 'bold'}}>{row.tipologiaFattura}</TableCell>
                <TableCell align='center'>{row.numeroFatture}</TableCell>
                <TableCell align='center' >{row.annoRiferimento}</TableCell>
                <TableCell align='center' >{month[row.meseRiferimento - 1]}</TableCell>
                <TableCell align='right' >{row.importo.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}</TableCell>
            </TableRow>
           
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0, borderColor:"white" }} colSpan={12}>
                   
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        {detailsSingleRow.length < 1 && open ?<Skeleton variant="text" sx={{ fontSize: '1rem',height:'250px' }} /> :
                            <Box sx={{ margin: 2 , padding:'10px'}}>
                                <Typography sx={{marginLeft:"6px"}} variant="h6" gutterBottom component="div">
                Dettaglio 
                                </Typography>
                                <Table size="small" aria-label="purchases">
                                    <div
                                        style={{
                                            overflowY: "auto",
                                            maxHeight: "250px",
                                            width: "100%"
                                        }}
                                    >
                                        <TableHead  sx={{position: "sticky", top:'0',zIndex:"1",backgroundColor: "white"}}>
                                            <TableRow sx={{borderColor:"white",borderWidth:"thick"}}>
                                                <TableCell sx={{ marginLeft:"16px"}} >Ragione sociale</TableCell>
                                                <TableCell sx={{ marginLeft:"16px"}} >Tipologia Fattura</TableCell>
                                                <TableCell sx={{ marginLeft:"16px"}}>Anno</TableCell>
                                                <TableCell sx={{ marginLeft:"16px"}}>Mese</TableCell>
                                                <TableCell sx={{ marginLeft:"16px"}}>Data</TableCell>
                                                <TableCell sx={{ marginLeft:"16px"}}>Importo</TableCell>
                                            </TableRow>
                                        </TableHead>
                               
                                        <TableBody sx={{borderColor:"white",borderWidth:"thick"}}>
                                            { detailsSingleRow.map((obj) => (
                                                <TableRow key={Math.random()}>
                                                    <TableCell>{obj.ragioneSociale}</TableCell>
                                                    <TableCell>
                                                        {obj.tipologiaFattura}
                                                    </TableCell>
                                                    <TableCell  component="th" scope="row"> {obj.annoRiferimento} </TableCell>
                                                    <TableCell align="center" >{month[obj.meseRiferimento-1]}</TableCell>
                                                    <TableCell>{new Date(obj.dataFattura).toLocaleString().split(",")[0]||''}</TableCell>
                                                    <TableCell  align="right"component="th" scope="row">
                                                        {obj.importo.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                            }
                                        </TableBody>
                                    </div>
                                </Table>
                            </Box>
                        }
                    </Collapse>
                </TableCell>
            </TableRow> 
        </TableBody>);
   
   
   
};

export default RowJsonSap;

/*
  <TableCell style={{ paddingBottom: 0, paddingTop: 0, borderColor:"white" }} colSpan={1}>
                    <div  id='loader_popup_json_to_sap'>
                        <Loader sentence="Attendere..."></Loader> 
                    </div>
                </TableCell>  */