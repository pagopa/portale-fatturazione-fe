import { Card, Table, TableBody, TableCell, TableHead, TablePagination, TableRow } from "@mui/material";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { MainState } from "../../types/typesGeneral";
import { getListaRel, manageError } from "../../api/api";
import { useNavigate } from "react-router";

import { useEffect, useState } from "react";
import { BodyRel } from "../../types/typeRel";

interface GridCustomProps {
    elements:object[],
    changePage:any,
    changeRow:any,
    page:number,
    total:number,
    rows:number,
    headerNames:string[],
    setMainState:any,
    nameParameterApi:string | string[]  // elemnto/i che servono alla chiamata get di dettaglio , in questo caso bisogna passare questi pametro/o nel MainState ma non posso visulizzarli nella grid
   
}

const GridCustom : React.FC<GridCustomProps> = ({elements, changePage, changeRow, page, total, rows, headerNames, setMainState, nameParameterApi}) =>{

    const navigate = useNavigate();
    


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

                                    // const cssFirstColum = {color:'#0D6EFD', fontWeight: 'bold', cursor: 'pointer'};
                                    console.log(nameParameterApi, 'yyy', element.nameParameterApi, element);
                                    // const {idTestata, ...newElement} = element;
                                  

                                    return (
                
                                        <TableRow key={element.idEnte}>
                                            {
                                                Object.values(element).map((value:any, i:number)=>{

                                                    return (
                                                        <TableCell 
                                                            onClick={()=>{
                                                                if(i === 0){
                                                                    console.log(element);
                                                                    setMainState((prev:MainState)=> ({...prev, ...{idRel:element.nameParameterApi}}));
                                                                    navigate('/relpdf');
                                                                }
                                                                           
                                                            } }
                                                        >
                                                            {value}
                                                        </TableCell>
                                                    );
                                                })
                                            }
                          
                            
                                            <TableCell  onClick={()=>{
                                                setMainState((prev:MainState)=> ({...prev, ...{idRel:element.idTestata}})); 
                                                navigate('/relpdf');            
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
                />  
            </div>
        </div>
        
    );
};

export default GridCustom;





