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
    console.log({apiDetail});
    
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


    const isSelected = selected.some(el =>{
        const result = el.annoRiferimento === row.annoRiferimento &&
             el.meseRiferimento === row.meseRiferimento &&
              el.tipologiaFattura === row.tipologiaFattura;

        return result;
    });

    const isEqual = (obj1, obj2) => 
        Object.keys(obj1).length === Object.keys(obj2).length &&
        Object.keys(obj1).every(key => obj1[key] === obj2[key]);

    console.log({isSelected,selected});

    let tooltipObj:any= {label:'...',title:'...'};
    if(row.statoInvio === 0){
        tooltipObj = {label:'Da inviare',title:'Da inviare',color:'info'};
    }else if(row.statoInvio === 2){
        tooltipObj = {label:'Elaborazione',title:'La fattura è in elaborazione',color:'warning'};
    }

    return(
        
        <TableBody sx={{minHeight:"100px"}}>
            <TableRow  sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell padding="checkbox" sx={{width:'80px'}}>
                    <Checkbox
                        
                        color="primary"
                        checked={isSelected}
                        disabled={row.statoInvio === 2}
                        onChange={()=>{
                            if(!isSelected){
                                setSelected(prev => ([...prev,{ 
                                    annoRiferimento: row.annoRiferimento,
                                    meseRiferimento: row.meseRiferimento,
                                    tipologiaFattura: row.tipologiaFattura}]));
                            }else{
                                const deleteEl = selected.filter(obj => !isEqual(obj, { 
                                    annoRiferimento: row.annoRiferimento,
                                    meseRiferimento: row.meseRiferimento,
                                    tipologiaFattura: row.tipologiaFattura}));
                                console.log({deleteEl, row});
                                setSelected(deleteEl);
                            }
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
                <TableCell align='center'>
                    <Tooltip
                        placement="bottom"
                        title={tooltipObj.title}
                    >
                        <Chip label={tooltipObj.label} color={tooltipObj.color} />
                    </Tooltip>
                </TableCell>
                <TableCell align='center'>{row.numeroFatture}</TableCell>
                <TableCell align='center' >{row.annoRiferimento}</TableCell>
                <TableCell align='center' >{month[row.meseRiferimento - 1]}</TableCell>
                <TableCell align='right' >{row.importo.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0, borderColor:"white" }} colSpan={12}>
                   
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        {detailsSingleRow.length < 1 && open ?<Skeleton variant="text" sx={{ fontSize: '1rem',height:'250px',margin: 2 , padding:'10px' }} /> :
                            <Box sx={{ margin: 2 , padding:'10px'}}>
                                <Typography sx={{marginLeft:"6px"}} variant="h6" gutterBottom component="div">
                Dettaglio 
                                </Typography>
                                <Table size="small" aria-label="purchases">
                                    <Box
                                        style={{
                                            overflowY: "auto",
                                            maxHeight: "250px",
                                            width: "100%"
                                        }}
                                    >
                                        <TableHead  sx={{position: "sticky", top:'0',zIndex:"1",backgroundColor: "white"}}>
                                            <TableRow>
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
                                    </Box>
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