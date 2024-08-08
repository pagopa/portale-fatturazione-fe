import { Card, Table, TableBody, TableCell, TableHead, TablePagination, TableRow } from "@mui/material";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { getStatusApp, setInfoToStatusApplicationLoacalStorage } from "../../../reusableFunction/actionLocalStorage";
import { Rel } from "../../../types/typeRel";
import { NotificheList } from "../../../types/typeReportDettaglio";
interface GridCustomProps {
    elements:NotificheList[]|Rel[],
    changePage:(event: React.MouseEvent<HTMLButtonElement> | null,newPage: number) => void,
    changeRow:( event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void,
    page:number,
    total:number,
    rows:number,
    headerNames:string[],
    nameParameterApi:string,  // elemnto/i che servono alla chiamata get di dettaglio , in questo caso bisogna passare questi pametro/o nel MainState ma non posso visulizzarli nella grid
    apiGet:(id:string)=>void, 
    disabled:boolean
}

const GridCustom : React.FC<GridCustomProps> = ({elements, changePage, changeRow, page, total, rows, headerNames, nameParameterApi, apiGet, disabled}) =>{

    const statusApp = getStatusApp();

    const handleClickOnGrid = (element) =>{
     
        const newState= {
            nomeEnteClickOn:element.ragioneSociale,
            mese:element.mese,
            anno:element.anno,
            idElement:element[nameParameterApi]
        };
        setInfoToStatusApplicationLoacalStorage(statusApp,newState);
       
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
                                        <TableCell key={Math.random()}>
                                            {el}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        </TableHead>

                        {elements.length === 0 ?
                            <TableBody  style={{height: '50px'}}>

                            </TableBody> :
                            <TableBody sx={{marginLeft:'20px'}}>
                                {elements.map((element:Rel|NotificheList) =>{
                                    // tolgo da ogni oggetto la prima chiave valore  perchè il cliente non vuole vedere es. l'id ma serve per la chiamata get di dettaglio 
                                    const sliced = Object.fromEntries(
                                        Object.entries(element).slice(1)
                                    );
                                    if(sliced?.tipologiaFattura === 'ASSEVERAZIONE'){
                                        return (
                
                                            <TableRow key={Math.random()}>
                                                {
                                                    Object.values(sliced).map((value:string, i:number)=>{
                                                        const cssFirstColum = i === 0 ? {color:'#606060', fontWeight: 'bold', cursor: 'pointer'} : null;
                                                        return (
                                                            <TableCell
                                                                key={Math.random()}
                                                                sx={cssFirstColum} 
                                                            >
                                                                {value}
                                                            </TableCell>
                                                        );
                                                    })
                                                }
                                            </TableRow>
                                        );
                                    }else{
                                        return (
                                            <TableRow key={Math.random()}>
                                                {
                                                    Object.values(sliced).map((value:string|number, i:number)=>{
                                                        const cssFirstColum = i === 0 ? {color:'#0D6EFD', fontWeight: 'bold', cursor: 'pointer'} : null;
                                                        return (
                                                            <TableCell
                                                                sx={cssFirstColum} 
                                                                key={Math.random()}
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
                                
                                                <TableCell onClick={()=>{
                                                    handleClickOnGrid(element);            
                                                } }>
                                                    <ArrowForwardIcon sx={{ color: '#1976D2', cursor: 'pointer' }} /> 
                                                </TableCell>
                       
                                            </TableRow>
                    
                                        );
                                    }
                                    
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
