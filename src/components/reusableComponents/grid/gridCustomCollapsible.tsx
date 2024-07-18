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
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useEffect, useState } from 'react';
import { Card, Checkbox, TablePagination, Toolbar, Tooltip } from '@mui/material';
import { GridCollapsible } from '../../../types/typeFatturazione';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';


const CollapsibleTable: React.FC<GridCollapsible> = ({data, showedData, setShowedData, headerNames}) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [count, setCount] = useState(0);
    
    
    
    useEffect(()=>{
        setCount(data.length);
        setPage(0);
        setRowsPerPage(10);
        setShowedData(data.slice(0, 10));
        // setOpen(false);
    },[data]);
    
    useEffect(()=>{
        let from = 0;
        if(page === 0){
            from = 0;
        }else{
            from = page * rowsPerPage;
        }
        setShowedData(data.slice(from, rowsPerPage + from));
    },[page,rowsPerPage]);
    return (
        <>
            <div style={{overflowX:'auto'}}>
                <Card sx={{width: '2000px'}}  >
                    <EnhancedTableToolbar numSelected={10}></EnhancedTableToolbar>
                    <TableContainer component={Paper}>
                        <Table aria-label="collapsible table">
                            <TableHead sx={{backgroundColor:'#f2f2f2'}}>
                                <TableRow>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            color="primary"
                                            indeterminate={false}
                                            checked={false}
                                            onChange={()=> console.log('ciao')}
                                            inputProps={{
                                                'aria-label': 'select all desserts',
                                            }}
                                        />
                                    </TableCell>
                                    {headerNames.map((el)=>{
                                        return(
                                            <TableCell align={el.align} key={el.id}>{el.name}</TableCell>
                                        );
                                    })}
                                </TableRow>
                            </TableHead>
                            {showedData.length === 0 ? <TableBody  style={{height: '50px'}}>

                            </TableBody> :
                                showedData.map((row) => {
            
                                    return(
                                        <Row key={row.id} row={row}></Row>
                                    ); })}
                        </Table>
                    </TableContainer>
                </Card>
            </div>
            <div className="pt-3"> 
                <TablePaginationDemo 
                    setRowsPerPage={setRowsPerPage}
                    setPage={setPage}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    count={count}
                ></TablePaginationDemo>
            </div>  
        </>
    );
};
export default CollapsibleTable;
    
    
const Row = ({row}) => {
    const [open, setOpen] = useState(false);
 
    return(
        
        <TableBody sx={{minHeight:"100px"}}>
            <TableRow  sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell padding="checkbox">
                    <Checkbox
                        color="primary"
                        indeterminate={false}
                        checked={false}
                        onChange={()=>console.log('change')}
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
                <TableCell sx={{color:'#0D6EFD',fontWeight: 'bold'}} >{row.ragionesociale}</TableCell>
                <TableCell align='center' >{row.tipocontratto}</TableCell>
                <TableCell align='right' >{row.totale.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}</TableCell>
                <TableCell align='right' >{row.numero}</TableCell>
                <TableCell align='center' >{row.tipoDocumento}</TableCell>
                <TableCell align='center' >{row.divisa}</TableCell>
                <TableCell align='center' >{row.metodoPagamento}</TableCell>
                <TableCell align='center'>{row.identificativo}</TableCell>
                <TableCell align='center'>{row.tipologiaFattura}</TableCell>
                <TableCell align='center'>{row?.split?.toString()|| ''}</TableCell>
                <TableCell align='center'>{row.dataFattura !== null ? new Date(row.dataFattura).toLocaleString().split(',')[0] : ''}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
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
                                    </TableRow>
                                </TableHead>
                                <TableBody sx={{borderColor:"white",borderWidth:"thick"}}>
                                    {row.posizioni.map((obj) => (
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
        </TableBody>);
   
   
   
};
    
    
    
    
    
const TablePaginationDemo = ({setPage, page, rowsPerPage, setRowsPerPage, count}) => {
        
        
    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        setPage(newPage);
    };
        
    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
        
    return (
        <TablePagination
            component="div"
            count={count}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
        />
    );
};

interface EnhancedTableToolbarProps {
    numSelected: number;
}
  

const EnhancedTableToolbar = (props: EnhancedTableToolbarProps) =>{
    const { numSelected } = props;
  
    return (
        <Toolbar
            sx={{bgcolor: '#D6E8FB'}}
        >
            {numSelected > 0 && (
                <Typography
                    sx={{ flex: '1 1 100%' }}
                    color="inherit"
                    variant="subtitle1"
                    component="div"
                >
                    {numSelected} selected
                </Typography>
            )}
            {numSelected > 0 && (
                <Tooltip title="Delete">
                    <IconButton>
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
            )}
        </Toolbar>
    );
};
    