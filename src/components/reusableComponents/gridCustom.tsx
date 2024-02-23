import { Card, Table, TableBody, TableCell, TableHead, TablePagination, TableRow } from "@mui/material";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { MainState } from "../../types/typesGeneral";
import { getListaRel, manageError } from "../../api/api";
import { useNavigate } from "react-router";

import { useEffect, useState } from "react";
import { BodyRel } from "../../types/typeRel";

interface GridCustomProps {
    elements:object[],
    elementSelected:object,
    setElementSelected: any,
    body: BodyRel,
    mainState:MainState,
    setBody:any
}

const GridCustom : React.FC<GridCustomProps> = ({elements, elementSelected, setElementSelected, body, mainState, setBody}) =>{



    const navigate = useNavigate();
    const getToken = localStorage.getItem('token') || '{}';
    const token =  JSON.parse(getToken).token;

    const getProfilo = localStorage.getItem('profilo') || '{}';
    const profilo =  JSON.parse(getProfilo);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalNotifiche, setTotalNotifiche]  = useState(0);


    useEffect(()=>{
        setBody((prev:BodyRel) => ({...prev, ...{page:page,pageSize:rowsPerPage}}));
    },[]);

   

    const getlistaRelEnte = async (nPage:number, nRow:number) => {
     
      
        await  getListaRel(token,mainState.nonce,nPage, nRow, body)
            .then((res)=>{
                console.log(res);
                        
            }).catch((error)=>{
                
                manageError(error, navigate);
            });
                    
    };


    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
     
        const realPage = newPage + 1;
        if(profilo.auth === 'SELFCARE'){
            // getlistaNotifiche(realPage,rowsPerPage);
            
        }
        if(profilo.auth === 'PAGOPA'){
            // getlistaNotifichePagoPa(realPage,rowsPerPage);
            //listaEntiNotifichePageOnSelect();
        }
        setPage(newPage);
    };
                    
    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
    
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
        const realPage = page + 1;

        if(profilo.auth === 'SELFCARE'){
            //  getlistaNotifiche(realPage,parseInt(event.target.value, 10));
            
        }
        if(profilo.auth === 'PAGOPA'){
            // getlistaNotifichePagoPa(realPage,parseInt(event.target.value, 10));
            //listaEntiNotifichePageOnSelect();
        }
                            
    };

    return (
        <div>
            <div>
                <Card sx={{width: '2000px'}}  >
                    <Table >
                        <TableHead sx={{backgroundColor:'#f2f2f2'}}>
                            <TableRow>
                                {Object.keys(elements[0]).map((el)=>{
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

                                    const cssFirstColum = {color:'#0D6EFD', fontWeight: 'bold', cursor: 'pointer'};

                                    return (
                
                                        <TableRow key={element.idEnte}>
                                            {
                                                Object.values(element).map((value:any)=>{

                                                    return (
                                                        <TableCell 
                                                            onClick={()=>{
                                                                console.log(element);             
                                                            } }
                                                        >
                                                            {value}
                                                        </TableCell>
                                                    );
                                                })
                                            }
                          
                            
                                            <TableCell  onClick={()=>{
                                                console.log('000');              
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
                    count={totalNotifiche}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />  
            </div>
        </div>
        
    );
};

export default GridCustom;





