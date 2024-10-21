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
import { MainState } from '../../../../types/typesGeneral';


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
    handleModifyMainState:any,
    mainState:MainState,
    //stato:boolean,
    //setOpenConfermaModal:any,
    //setOpenResetFilterModal:any,
    //monthFilterIsEqualMonthDownload:boolean,
    //showedData:FattureObj[],
    //setShowedData: Dispatch<SetStateAction<FattureObj[]>>,
}


const CollapsibleTablePa: React.FC<any> = ({data, headerNames,handleModifyMainState,page,setPage,rowsPerPage,setRowsPerPage,mainState}) => {
    const [count, setCount] = useState(0);
    const [showedData, setShowedData] = useState<DocContabili[]>([]);

    useEffect(()=>{
        if(mainState.filterDocContabili.infoPage.page !== 0 || mainState.filterDocContabili.infoPage.row !== 0 ){

            let from = 0;
            if(page === 0){
                from = 0;
            }else{
                from = mainState.filterDocContabili.infoPage.page * mainState.filterDocContabili.infoPage.row;
            }
    
            setCount(data.length);
            setShowedData(data.slice(from, mainState.filterDocContabili.infoPage.row + from));
            setPage(mainState.filterDocContabili.infoPage.page);
            setRowsPerPage(mainState.filterDocContabili.infoPage.row);
        }

    },[]);


    useEffect(()=>{
        let from = 0;
        if(page === 0){
            from = 0;
        }else{
            from = page * rowsPerPage;
        }

        setCount(data.length);
        setShowedData(data.slice(from, rowsPerPage + from));

        const filter = mainState.filterDocContabili;
        const newInfoPage = {infoPage:{page:page,row:rowsPerPage}};
        const newFilter = {...filter,...newInfoPage};

        handleModifyMainState({filterDocContabili:newFilter});
    },[data,page,rowsPerPage]);
    
    /*
    useEffect(()=>{
        
        let from = 0;
        if(page === 0){
            from = 0;
        }else{
            from = page * rowsPerPage;
        }
        //i dati che vengono mostrati
        setShowedData(data.slice(from, rowsPerPage + from));

        //mi aggiorno lo state
        const filter = mainState.filterDocContabili;
        const newInfoPage = {infoPage:{page:page,row:rowsPerPage}};
        const newFilter = {...filter,...newInfoPage};

        handleModifyMainState({filterDocContabili:newFilter});
        
    },[page,rowsPerPage]);

*/




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
                                            return(<TableCell sx={{width:'70px'}} align={el.align} key={el.id}></TableCell>);
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
                                        handleModifyMainState={handleModifyMainState}
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
    
    

    
    
    
    
    



    