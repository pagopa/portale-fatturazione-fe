import { Card, Table, TableBody, TableCell, TableHead, TablePagination, TableRow } from "@mui/material";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { name } from "@azure/msal-browser/dist/packageMetadata";

interface GridCustomProps {
    elements:object[],
    changePage:any,
    changeRow:any,
    page:number,
    total:number,
    rows:number,
    headerNames:string[],
    nameParameterApi:string,  // elemnto/i che servono alla chiamata get di dettaglio , in questo caso bisogna passare questi pametro/o nel MainState ma non posso visulizzarli nella grid
    apiGet:any,
    disabled:boolean
}

const GridCustom : React.FC<GridCustomProps> = ({elements, changePage, changeRow, page, total, rows, headerNames, nameParameterApi, apiGet, disabled}) =>{

    const handleClickOnGrid = (element) =>{
     
        const string = JSON.stringify({
            nomeEnteClickOn:element.ragioneSociale,
            mese:element.mese,
            anno:element.anno,
            idElement:element[nameParameterApi]
        });
        localStorage.setItem('statusApplication', string);
        apiGet(element[nameParameterApi]);
    };
   
    return (
        <div>
            <div style={{overflowX:'auto'}}>
                <Card sx={{width: '2000px'}}  >
                    <Table >
                        <TableHead sx={{backgroundColor:'#f2f2f2'}}>
                            <TableRow>
                                {headerNames.map((el)=>{
                                    return (
                                        <TableCell>
                                            {el}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        </TableHead>

                        {elements.length === 0 ?
                            <div className="" style={{height: '50px'}}>

                            </div> :
                            <TableBody sx={{marginLeft:'20px'}}>
                                {elements.map((element:any) =>{

                                    // tolgo da ogni oggetto la prima chiave valore  perchè il cliente non vuole vedere es. l'id ma serve per la chiamata get di dettaglio 
                                    const sliced = Object.fromEntries(
                                        Object.entries(element).slice(1)
                                    );
                                  
                                    return (
                
                                        <TableRow key={element[nameParameterApi]}>
                                            {
                                                Object.values(sliced).map((value:any, i:number)=>{
                                                    const cssFirstColum = i === 0 ? {color:'#0D6EFD', fontWeight: 'bold', cursor: 'pointer'} : null;
                                                  
                                                    return (
                                                        
                                                        <TableCell
                                                            sx={cssFirstColum} 
                                                            onClick={()=>{
                                                                if(i === 0){
                                                                    handleClickOnGrid(element);
                                                                }            
                                                            } }
                                                        >
                                                            {value}
                                                        </TableCell>
                                                    );
                                                   
                                                })
                                            }
                            
                                            <TableCell  onClick={()=>{
                                                apiGet(element[nameParameterApi]);            
                                            } }>
                                                <ArrowForwardIcon sx={{ color: '#1976D2', cursor: 'pointer' }} /> 
                                            </TableCell>
                   
                                        </TableRow>
                
                                    );
                                } )}
                            </TableBody>
                        }
                    </Table>
                            
                </Card>
            </div>
            <div className="pt-3">                           
                <TablePagination
                    sx={{'.MuiTablePagination-selectLabel': {
                        display:'none',
                        backgroundColor:'#f2f2f2'
                                                
                    }}}
                    component="div"
                    page={page}
                    count={total}
                    rowsPerPage={rows}
                    onPageChange={changePage}
                    onRowsPerPageChange={changeRow}
                    SelectProps={{
                        disabled: disabled
                    }}
                    backIconButtonProps={
                        disabled
                            ? {
                                disabled: disabled
                            }
                            : undefined
                    }
                    nextIconButtonProps={
                        disabled
                            ? {
                                disabled: disabled
                            }
                            : undefined
                    }
                ></TablePagination>
            </div>
        </div>
        
    );
};

export default GridCustom;
