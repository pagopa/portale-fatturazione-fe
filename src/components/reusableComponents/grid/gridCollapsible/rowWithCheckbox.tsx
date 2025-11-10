import { Box, Checkbox, Chip, Collapse, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import { useState } from "react";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const Row = ({row, setSelected,selected,setOpenResetFilterModal,monthFilterIsEqualMonthDownload}) => {
    const [open, setOpen] = useState(false);
   
  
    const handleClick = ( id: number) => {

        if(monthFilterIsEqualMonthDownload){
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
        }else{
            setOpenResetFilterModal(true);
        }
        
    };

    const isSelected = (id: number) => selected.indexOf(id) !== -1;

    let tooltipObj:any= {label:'Non Inviata',title:'La fattura non è stata inviata'};
    if(row.inviata === 1){
        tooltipObj = {label:'Inviata',title:'La fattura è stata inviata',color:'success'};
    }else if(row.inviata === 2){
        tooltipObj = {label:'Elaborazione',title:'La fattura è in elaborazione',color:'warning'};
    }else if(row.inviata === 3){
        tooltipObj = {label:'Cancellata',title:'La fattura è stata cancellata',color:'info'};
    }
    console.log({row});
    return(
        
        <TableBody sx={{minHeight:"100px"}}>
            <TableRow sx={{
                height: '80px',
                borderTop: '4px solid #F2F2F2',
                borderBottom: '2px solid #F2F2F2',
                '&:hover': {
                    backgroundColor: '#EDEFF1',
                },
                '& > *': { borderBottom: 'unset' }
            }}>
                <TableCell padding="checkbox">
                    <Checkbox
                        color="primary"
                        indeterminate={false}
                        checked={isSelected(row.idfattura)}
                        disabled={row.elaborazione === 2}
                        onChange={()=>{
                            handleClick(row.idfattura);
                        }}
                        inputProps={{
                            'aria-label': 'select all desserts',
                        }}
                    />
                </TableCell>
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
                <Tooltip  title={row?.ragionesociale?.length > 20 ? row?.ragionesociale : null }>
                    <TableCell  sx={{color:'#0D6EFD',fontWeight: 'bold'}} >{row.ragionesociale?.toString().length > 20 ? row.ragionesociale?.toString().slice(0, 20) + '...' : row.ragionesociale}</TableCell>
                </Tooltip>
                <TableCell align='center'>{row.dataFattura !== null ? new Date(row.dataFattura).toLocaleString().split(',')[0] : ''}</TableCell>
                <TableCell align='center'>
                    <Tooltip
                        placement="bottom"
                        title={tooltipObj.title}
                    >
                        <Chip variant="outlined" label={tooltipObj.label} color={tooltipObj.color} />
                    </Tooltip>
                </TableCell>
                <TableCell align='center'>{row.tipologiaFattura||"--"}</TableCell>
                <TableCell align='center'>{row.identificativo||"--"}</TableCell>
                <TableCell align='center' >{row.tipocontratto||"--"}</TableCell>
                <TableCell align='right' >{row.totale.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}</TableCell>
                <TableCell align='right' >{row.numero === null ? "--":row.numero}</TableCell>
                <TableCell align='center' >{row.tipoDocumento||"--"}</TableCell>
                <TableCell align='center' >{row.divisa||"--"}</TableCell>
                <TableCell align='center' >{row.metodoPagamento||"--"}</TableCell>
                <TableCell align='center'>{row?.split?.toString()|| '--'}</TableCell>
                
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2 , backgroundColor:'#F8F8F8', padding:'10px'}}>
                            <Typography sx={{marginLeft:"6px"}} variant="h6" gutterBottom component="div">
                Posizioni
                            </Typography>
                            <Table size="small" aria-label="purchases">
                                <TableHead>
                                    <TableRow sx={{borderColor:"white",borderWidth:"thick"}}>
                                        <TableCell sx={{ marginLeft:"16px"}} >Numero Linea</TableCell>
                                        <TableCell sx={{ marginLeft:"16px"}}>Codice Materiale</TableCell>
                                        <TableCell sx={{ marginLeft:"16px"}}>Imponibile</TableCell>
                                        <TableCell sx={{ marginLeft:"16px"}}>Periodo di riferimento</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody sx={{borderColor:"white",borderWidth:"thick"}}>
                                    {row?.posizioni?.map((obj) => (
                                        <TableRow key={Math.random()}>
                                            <TableCell>
                                                {obj.numerolinea}
                                            </TableCell>
                                            <TableCell>{obj.codiceMateriale}</TableCell>
                                            <TableCell align="right" component="th" scope="row">
                                                {obj.imponibile.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                                            </TableCell>
                                            <TableCell >{obj.periodoRiferimento}</TableCell>
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

export default Row;