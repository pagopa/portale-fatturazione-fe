import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useEffect, useState } from 'react';
import { Card} from '@mui/material';
import { FattureObj, GridCollapsible, HeaderCollapsible } from '../../../../types/typeFatturazione';
import TablePaginationDemo from './tablePagination';
import Row from './rowWithCheckbox';
import RowBase from './rowBase';


export interface DocContabili {
    name: string,
    contractId: string,
    tipoDoc: string,
    codiceAggiuntivo: string,
    vatCode: string,
    valuta: string,
    id:number,
    numero: string,
    data: string,
    bollo: string,
    riferimentoData: string,
    yearQuarter: string,
    posizioni: [
        {
            category: string,
            progressivoRiga: number,
            codiceArticolo: string,
            descrizioneRiga: string,
            quantita:number,
            importo: number,
            codIva: string,
            condizioni: string,
            causale: string,
            indTipoRiga: string
        }
    ],
    reports: string[]
}

export interface GridCollapsibleBase{
    data:DocContabili[],
    headerNames:HeaderCollapsible[],
    //stato:boolean,
    //setOpenConfermaModal:any,
    //setOpenResetFilterModal:any,
    //monthFilterIsEqualMonthDownload:boolean,
    selected:number[],
    setSelected:any,
    //showedData:FattureObj[],
    //setShowedData: Dispatch<SetStateAction<FattureObj[]>>,
}


const CollapsibleTablePa: React.FC<GridCollapsibleBase> = ({data, headerNames,selected,setSelected}) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [count, setCount] = useState(0);
    const [showedData, setShowedData] = useState<DocContabili[]>([]);
   
    useEffect(()=>{
        setCount(data.length);
        setPage(0);
        setRowsPerPage(10);
        setShowedData(data.slice(0, 10));
        //setSelected([]);
       
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
                
                <Card sx={{width: '1300px'}}  >
                    
                    <TableContainer component={Paper}>
                        
                        <Table aria-label="collapsible table">
                           
                            <TableHead sx={{backgroundColor:'#f2f2f2'}}>
                                <TableRow>
                                    <TableCell padding="checkbox">
                                    </TableCell>
                                    {headerNames.map((el)=>{
                                        if(el.name === ''){
                                            return;
                                            
                                        }else if(el.name === 'Arrow'){
                                            return(<TableCell sx={{width:'100px'}} align={el.align} key={el.id}></TableCell>);
                                        }else{
                                            return(<TableCell align={el.align} key={el.id}>{el.name}</TableCell>);
                                        }
                                    })}
                                </TableRow>
                            </TableHead>
                            {showedData.length === 0 ? <TableBody  style={{height: '50px'}}>

                            </TableBody>: showedData.map((row) => {
            
                                return(
                                    <RowBase key={row.id} 
                                        row={row}
                                        setSelected={setSelected}
                                        selected={selected}
                                    ></RowBase>
                                ); })}
                        </Table>
                    </TableContainer>
                   
                </Card>
            </div>
            <div className="mt-3"> 
             
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
export default CollapsibleTablePa;
    
    

    
    
    
    
    



    