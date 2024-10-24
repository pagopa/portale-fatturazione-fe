import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useContext, useEffect, useState } from 'react';
import { Card, TablePagination} from '@mui/material';
import { FattureObj, GridCollapsible, HeaderCollapsible } from '../../../../types/typeFatturazione';
import TablePaginationDemo from './tablePagination';
import Row from './rowWithCheckbox';
import RowBase from './rowBase';
import { MainState } from '../../../../types/typesGeneral';
import { GlobalContext } from '../../../../store/context/globalContext';


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


const CollapsibleTablePa = ({data, headerNames,page,setPage,rowsPerPage,setRowsPerPage}) => {
   
    const globalContextObj = useContext(GlobalContext);
    const {dispatchMainState, mainState} = globalContextObj;
 
    console.log(rowsPerPage,'rows');


    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };
   
   
   
   
    const [count, setCount] = useState(0);
    const [showedData, setShowedData] = useState<DocContabili[]>([]);
  
    
    
    useEffect(()=>{

        setCount(data.length);
        setShowedData(data.slice(0, 10));
        /*
        const filter = mainState.filterDocContabili;
        const newInfoPage = {infoPage:{page:page,row:rowsPerPage}};
        const newFilter = {...filter,...newInfoPage};

        handleModifyMainState({filterDocContabili:newFilter});*/
    },[data]);
    
    
   

    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {

        let from = 0;
        if(newPage === 0){
            from = 0;
        }else{
            from = newPage * rowsPerPage;
        }
    
        setShowedData(data.slice(from, rowsPerPage + from));
        setPage(newPage);
        const filters = mainState.filterDocContabili;
        const newFilters = {...filters,  ...{infoPage:{row:rowsPerPage,page:newPage}}};
        handleModifyMainState({filterDocContabili:newFilters});
    };
    
    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
       
    
        setShowedData(data.slice(0, event.target.value));
        setRowsPerPage(event.target.value);
        setPage(0);
        const filters = mainState.filterDocContabili;
        const newFilters = {...filters,  ...{infoPage:{row:event.target.value,page:0}}};
        handleModifyMainState({filterDocContabili:newFilters});
    };



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
                            {data.length === 0 ? <TableBody  style={{height: '50px'}}>

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
                <TablePagination
                    component="div"
                    count={count}
                    page={!count || count <= 0 ? 0 : page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />  
            </div>  
        </>
    );
};
export default CollapsibleTablePa;
    
    

    
    
    
    
    



    