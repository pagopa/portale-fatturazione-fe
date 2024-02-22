import { Card, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface GridCustomProps {
    elements:object[],
    elementSelected:object,
    setElementSelected: any


}

const GridCustom : React.FC<GridCustomProps> = ({elements, elementSelected, setElementSelected}) =>{



    return (
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
    );
};

export default GridCustom;





