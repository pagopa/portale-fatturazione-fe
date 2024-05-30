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
import { useState } from 'react';
import { Card, TablePagination } from '@mui/material';


interface Posizioni {
    numerolinea: number,
    testo: string,
    codiceMateriale: string,
    quantita: number,
    prezzoUnitario: number,
    imponibile: number
}

interface RowObj {
    id: number,
    totale: number,
    numero: number,
    dataFattura: string,
    prodotto: string,
    identificativo: string,
    tipologiaFattura: string,
    istitutioID: string,
    onboardingTokenID: string,
    ragionesociale: string,
    tipocontratto: string,
    idcontratto: string,
    tipoDocumento: string,
    divisa: string,
    metodoPagamento: string,
    causale: string,
    split: false,
    sollecito: string,
    posizioni:Posizioni[]
}

const Row =(props: { row:RowObj}) => {
    const { row } = props;
    const [open, setOpen] = useState(false);

    return (
        <React.Fragment>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
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
                <TableCell >{row.ragionesociale}</TableCell>
                <TableCell >{row.tipocontratto}</TableCell>
                <TableCell>{row.totale}</TableCell>
                <TableCell >{row.numero}</TableCell>
                <TableCell >{row.tipoDocumento}</TableCell>
                <TableCell>{row.divisa}</TableCell>
                <TableCell >{row.metodoPagamento}</TableCell>
                <TableCell >{row.identificativo}</TableCell>
                <TableCell>{row.tipologiaFattura}</TableCell>
                <TableCell >{row.split}</TableCell>
                <TableCell>{row.dataFattura}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <Typography variant="h6" gutterBottom component="div">
                Posizioni
                            </Typography>
                            <Table size="small" aria-label="purchases">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Numero Linea</TableCell>
                                        <TableCell>Testo</TableCell>
                                        <TableCell >Codice Materiale</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {row.posizioni.map((obj) => (
                                        <TableRow key={Math.random()}>
                                            <TableCell component="th" scope="row">
                                                {obj.numerolinea}
                                            </TableCell>
                                            <TableCell component="th" scope="row">
                                                {obj.testo}
                                            </TableCell>
                                            <TableCell>{obj.codiceMateriale}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>  
        </React.Fragment>
    );
};


const CollapsibleTable = ({data}) => {

    console.log(data);
    return (
        <>
            <div style={{overflowX:'auto'}}>
                <Card sx={{width: '2000px'}}  >
                    <Table >
                        <TableContainer component={Paper}>
                            <Table aria-label="collapsible table">
                                <TableHead sx={{backgroundColor:'#f2f2f2'}}>
                                    <TableRow>
                                        <TableCell />
                                        <TableCell>Ragione Sociale</TableCell>
                                        <TableCell >Tipo Contratto</TableCell>
                                        <TableCell >Tot.</TableCell>
                                        <TableCell >N. Fattura</TableCell>
                                        <TableCell >Tipo Documento</TableCell>
                                        <TableCell >Divisa</TableCell>
                                        <TableCell >M. Pagamento</TableCell>
                                        <TableCell >Ident.</TableCell>
                                        <TableCell >T. Fattura</TableCell>
                                        <TableCell >Split</TableCell>
                                        <TableCell >Data Fattura</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.map((row) => (
                                        <Row key={row.name} row={row} />
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Table>
                </Card>
            </div>
            <div className="pt-3"> 
                <TablePaginationDemo></TablePaginationDemo>
            </div>  
        </>
    );
};

export default CollapsibleTable;





const TablePaginationDemo = () => {
    const [page, setPage] = React.useState(2);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

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
            count={100}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
        />
    );
};
