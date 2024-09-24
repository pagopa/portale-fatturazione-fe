import { Card, Table, TableBody, TableCell, TableHead, TablePagination, TableRow } from "@mui/material";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from "react-router";
import { Dispatch} from "react";

import { ActionReducerType } from "../../reducer/reducerMainState";
import { Messaggi } from "../../page/messaggi";
interface GridCustomProps {
    elements:Messaggi[],
    changePage: (event: React.MouseEvent<HTMLButtonElement, MouseEvent> | null, newPage: number,) => void,
    changeRow:(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void,
    page:number,
    total:number,
    rows:number,
    headerNames:string[],
    nameParameterApi:string,  // elemnto/i che servono alla chiamata get di dettaglio , in questo caso bisogna passare questi pametro/o nel MainState ma non posso visulizzarli nella grid
    disabled:boolean,
    dispatchMainState:Dispatch<ActionReducerType>,
}

const GridMessaggi : React.FC<GridCustomProps> = ({elements, changePage, changeRow, page, total, rows, headerNames,disabled,dispatchMainState}) =>{

    const navigate = useNavigate() ;

    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };

    const handleClickOnGrid = (element) =>{
        navigate(`/dettagliomessaggio/${element.id}`);

        handleModifyMainState({messaggioSelected:element});
    };
   
    return (
        <div>
            <div>
                <Card >
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
                                {elements.map((element:Messaggi) =>{
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
                                                    Object.values(sliced).map((value:string, i:number)=>{
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

export default GridMessaggi;
