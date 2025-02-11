import { Card, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, Tooltip } from "@mui/material";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { GridElementListaPsp } from "../../../types/typeAngraficaPsp";
import { Rel } from "../../../types/typeRel";
import { NotificheList } from "../../../types/typeReportDettaglio";
import RowContratto from "./gridCustomBase/rowTipologiaContratto";
interface GridCustomProps {
    elements:NotificheList[]|Rel[]|GridElementListaPsp[]|any[],
    changePage:(event: React.MouseEvent<HTMLButtonElement> | null,newPage: number) => void,
    changeRow:( event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void,
    page:number,
    total:number,
    rows:number,
    headerNames:string[],
    nameParameterApi:string,  // elemnto/i che servono alla chiamata get di dettaglio , in questo caso bisogna passare questi pametro/o nel MainState ma non posso visulizzarli nella grid
    apiGet?:(el:any)=>void, 
    disabled:boolean,
    widthCustomSize:string
}

const GridCustom : React.FC<GridCustomProps> = ({elements, changePage, changeRow, page, total, rows, headerNames, nameParameterApi, apiGet, disabled, widthCustomSize}) =>{


    const handleClickOnGrid = (element) =>{
        if(apiGet && nameParameterApi === 'idContratto'){
            const newDetailRel = {
                name:element.ragioneSociale,
                tipologiaContratto:element.tipoContratto,
                idEnte:element.idEnte
            };
            apiGet(newDetailRel);

        }else if(apiGet){
            const newDetailRel = {
                nomeEnteClickOn:element.ragioneSociale,
                mese:element.mese,
                anno:element.anno,
                id:element[nameParameterApi]
            };
            apiGet(newDetailRel);
        }
    };
   
    return (
        <div>
            <div style={{overflowX:'auto'}}>
                <Card sx={{width: widthCustomSize}}  >
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
                            <TableBody key={Math.random()} style={{height: '50px'}}>
                            </TableBody> :
                            <TableBody sx={{marginLeft:'20px'}}>
                                {elements.map((element:Rel|NotificheList|GridElementListaPsp ) =>{
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
                                    }else if(nameParameterApi=== 'idContratto'){
                                        return (
                                            <RowContratto key={Math.random()} sliced={sliced} apiGet={apiGet} handleClickOnGrid={handleClickOnGrid} element={element} ></RowContratto>
                                        );
                                    }else{
                                        return (
                                            <TableRow key={Math.random()}>
                                                {
                                                    Object.values(sliced).map((value:string|number, i:number)=>{
                                                        const cssFirstColum = i === 0 ? {color:'#0D6EFD', fontWeight: 'bold', cursor: 'pointer'} : null;
                                                        const valueEl = (i === 0 && value?.toString().length > 50) ? value?.toString().slice(0, 50) + '...' : value;
                                                        return (
                                                            <Tooltip key={Math.random()} title={value}>
                                                                <TableCell
                                                                    sx={cssFirstColum} 
                                                                    onClick={()=>{
                                                                        if(i === 0){
                                                                            handleClickOnGrid(element);
                                                                        }            
                                                                    }}
                                                                >
                                                                    {valueEl}
                                                                </TableCell>
                                                            </Tooltip>
                                                        );
                                                    })
                                                }
                                                {apiGet && <TableCell onClick={()=>{
                                                    handleClickOnGrid(element);            
                                                } }>
                                                    <ArrowForwardIcon sx={{ color: '#1976D2', cursor: 'pointer' }} /> 
                                                </TableCell> }
                                            </TableRow>
                                        );}
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
                    page={total > 0 ? page:0}
                    count={total}
                    rowsPerPage={rows}
                    onPageChange={changePage}
                    onRowsPerPageChange={changeRow}
                ></TablePagination>
            </div>
        </div>
        
    );
};

export default GridCustom;
