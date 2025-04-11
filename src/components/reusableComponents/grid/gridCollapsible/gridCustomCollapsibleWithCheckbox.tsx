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
import { FattureObj, GridCollapsible } from '../../../../types/typeFatturazione';
import TablePaginationDemo from './tablePagination';
import EnhancedTableToolbar from './enhanceTableToolbar';
import Row from './rowWithCheckbox';
import { PathPf } from '../../../../types/enum';




const CollapsibleTable: React.FC<GridCollapsible> = ({data, headerNames,stato,setOpenConfermaModal,setOpenResetFilterModal,monthFilterIsEqualMonthDownload,selected, setSelected,updateFilters,pathPage,body,firstRender,infoPageLocalStorage,upadateOnSelctedChange}) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [count, setCount] = useState(0);
    const [showedData, setShowedData] = useState<FattureObj[]>([]);
   
    useEffect(()=>{
        if(firstRender && infoPageLocalStorage.rows){
            setPage(infoPageLocalStorage.page);
            setRowsPerPage(infoPageLocalStorage.rows);

            let from = infoPageLocalStorage.page;
            if(from !== 0){
                from = infoPageLocalStorage.page * infoPageLocalStorage.rows;
            }
            setShowedData(data.slice(from, infoPageLocalStorage.rows + from));
            setCount(data.length);
        }else{
            setCount(data.length);
            setPage(0);
            setRowsPerPage(10);
            setShowedData(data.slice(0, 10));
            setSelected([]);
        }
    },[data]);


    useEffect(()=>{
        if(!firstRender){
            upadateOnSelctedChange(page,rowsPerPage);
        }
       
    },[selected]);
    
    useEffect(()=>{
        if(!(firstRender && infoPageLocalStorage.rows)){
            let from = 0;
            if(page === 0){
                from = 0;
            }else{
                from = page * rowsPerPage;
            }
            setShowedData(data.slice(from, rowsPerPage + from));
        }
        
    },[page,rowsPerPage]);


    return (
        <>
            {selected.length > 0 && <EnhancedTableToolbar 
                numSelected={selected.length} 
                stato={stato} 
                selected={selected}
                setOpenConfermaModal={setOpenConfermaModal}
                setOpenResetFilterModal={setOpenResetFilterModal}
                monthFilterIsEqualMonthDownload={monthFilterIsEqualMonthDownload}></EnhancedTableToolbar>}
            
            <div style={{overflowX:'auto'}}>
                
                <Card sx={{width: '2000px'}}  >
                    
                    <TableContainer component={Paper}>
                        
                        <Table aria-label="collapsible table">
                           
                            <TableHead sx={{backgroundColor:'#f2f2f2'}}>
                                <TableRow>
                                    <TableCell padding="checkbox">
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
                                        <Row key={row.idfattura} 
                                            row={row}
                                            setSelected={setSelected}
                                            selected={selected}
                                            setOpenResetFilterModal={setOpenResetFilterModal}
                                            monthFilterIsEqualMonthDownload={monthFilterIsEqualMonthDownload}
                                        ></Row>
                                    ); })}
                        </Table>
                    </TableContainer>
                </Card>
            </div>
            <div className="pt-3"> 
                <TablePaginationDemo 
                    setRowsPerPage={setRowsPerPage}
                    setPage={setPage}
                    page={count > 0 ? page:0}
                    rowsPerPage={rowsPerPage}
                    count={count}
                    updateFilters={updateFilters}
                    pathPage={pathPage}
                    body={body}
                ></TablePaginationDemo>
            </div>  
        </>
    );
};
export default CollapsibleTable;
    
    

    
    
    
    
    



    