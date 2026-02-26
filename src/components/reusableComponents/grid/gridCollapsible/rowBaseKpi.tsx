import { Box, Collapse, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import { useState } from "react";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useNavigate } from "react-router";
import LinkIcon from '@mui/icons-material/Link';



const RowBaseKpi = ({row}) => {
    const [open, setOpen] = useState(false);
    const disableIcon = row.link === '' || row.link === null;
   

    const handleOnDownloadLink = (url,name) => {
        const link = document.createElement("a");
        link.href = url;
        link.download = name;
        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        //saveAs(url,name);     
    };
 
    return(
        
        <TableBody sx={{minHeight:"100px"}}>
            <TableRow 
                sx={{
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
                <Tooltip title={row.name?.length > 20 ? row.name :null}>
                    <TableCell sx={{color:'#0D6EFD',fontWeight: 'bold',cursor:'pointer',width:'250px'}}>{ row.name?.length > 20 ? row.name.slice(0, 20) + '...' : row.name}</TableCell>
                </Tooltip>
                <TableCell align='center'>{row.yearQuarter}</TableCell>
                <TableCell align='center' >{row.recipientId}</TableCell>
                <TableCell align='center' >{row.totale.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}</TableCell>
                <TableCell align='center' >{row.totaleSconto.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}</TableCell>
                <Tooltip title={row.kpiList}>
                    <TableCell align='center' >{ row.kpiList?.length > 15 ? row.kpiList.slice(0, 15) + '...' : row.kpiList}</TableCell>
                </Tooltip>
                <TableCell align='center' onClick={()=> {
                    if(!disableIcon){
                        handleOnDownloadLink(row.link, 'KPI');
                    }
                }}>
                    <Tooltip disableHoverListener={disableIcon} title="Download csv">
                        <span>
                            <IconButton  disabled={disableIcon}>
                                <LinkIcon sx={disableIcon ?{color:'grey'} :{ color: '#1976D2'}}  /> 
                            </IconButton>
                        </span>
                    </Tooltip>
                </TableCell>
            </TableRow>
            <TableRow >
                <TableCell style={{ paddingBottom: 0, paddingTop: 0}} colSpan={12}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2 , backgroundColor:'#F8F8F8', padding:'10px'}}>
                            <Typography sx={{marginLeft:"6px"}} variant="h6" gutterBottom component="div">
                Posizioni
                            </Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{borderColor:"white",borderWidth:"thick"}}>
                                        {/*<TableCell sx={{ marginLeft:"16px"}} >Nome PSP</TableCell> */} 
                                        <TableCell sx={{ marginLeft:"16px"}} >ID PSP</TableCell>
                                        <TableCell align="center" sx={{ marginLeft:"16px"}}>Totale transazioni</TableCell>
                                        <TableCell align="center" sx={{ marginLeft:"16px"}}>Totale</TableCell>
                                        <TableCell align="center" sx={{ marginLeft:"16px"}}>KPI ok</TableCell>
                                        <TableCell align="center" sx={{ marginLeft:"16px"}}>Percentuale sconto</TableCell>
                                        <TableCell align="center" sx={{ marginLeft:"16px"}}>Sconto</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody sx={{borderColor:"white",borderWidth:"thick"}}>
                                    {row?.posizioni?.map((obj) => (
                                        <TableRow key={Math.random()}>
                                            {/*<TableCell>{obj.pspName}</TableCell>*/}
                                            <TableCell>{obj.pspId}</TableCell>
                                            <TableCell align="center">{obj.trxTotal === null ? "--":obj.trxTotal}</TableCell>
                                            <TableCell align="right" component="th" scope="row">{obj.valueTotal.toLocaleString("de-DE", {style: "currency", currency: "EUR",maximumFractionDigits: 14 })}</TableCell>
                                            <TableCell  align="center">{obj.kpiOk  === null ? "--":obj.kpiOk}</TableCell>
                                            <TableCell align="center">{obj.percSconto  === null ? "--":obj.percSconto}%</TableCell>
                                            <TableCell align="right">{obj.valueDiscount.toLocaleString("de-DE", {style: "currency", currency: "EUR",maximumFractionDigits: 14 })}</TableCell>  
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

export default RowBaseKpi;