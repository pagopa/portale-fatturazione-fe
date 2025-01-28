import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useContext} from 'react';
import { Card, TablePagination} from '@mui/material';
import { HeaderCollapsible } from '../../../../types/typeFatturazione';
import { MainState } from '../../../../types/typesGeneral';
import { GlobalContext } from '../../../../store/context/globalContext';
import { DocContabili } from '../../../../types/typeDocumentiContabili';
import { PathPf } from '../../../../types/enum';

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
    //setDataPaginated: Dispatch<SetStateAction<FattureObj[]>>,
}


const CollapsibleTablePa = ({headerNames,page,setPage,rowsPerPage,setRowsPerPage,count,dataPaginated,RowComponent,updateFilters,body}) => {

    const globalContextObj = useContext(GlobalContext);
    const {dispatchMainState} = globalContextObj;
 
    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };

    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        setPage(newPage);
        updateFilters( newPage,rowsPerPage);
    };
    
    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setRowsPerPage(event.target.value);
        setPage(0);
        updateFilters( 0,event.target.value);
    };

    return (
        <>
            <div style={{overflowX:'auto'}}>
                <Card sx={{width: 'auto'}}  >
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
                            {dataPaginated.length === 0 ? <TableBody  style={{height: '50px'}}>
                            </TableBody>: dataPaginated.map((row) => {
                                return(
                                    <RowComponent key={row.key} 
                                        row={row}
                                        handleModifyMainState={handleModifyMainState}
                                    ></RowComponent>
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
    
    

    
    
    
    
    



    