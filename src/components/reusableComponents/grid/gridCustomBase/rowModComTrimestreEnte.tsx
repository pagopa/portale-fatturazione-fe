import { Box, Collapse, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import DefaultRow from "./rowDefault";
import { subHeaderNameModComTrimestraleENTE } from "../../../../assets/configurations/config_SubGridModComEnte";


const RowModComTrimestreEnte = ({sliced,headerNames,handleClickOnGrid,element}) => {
  
    
    const [open, setOpen] = useState(false);
    
    

    const isOpenOnStart = element.moduli.filter(el => el.source === "obbligatorio").length > 0;

    useEffect(()=>{
        isOpenOnStart && setOpen(true);
    },[isOpenOnStart]);


    let chipBgColor = "#A2ADB8";
    
    if(sliced.stato === "Completo"){
        chipBgColor = "#6CC66A";
    }

    const goToDetails = () =>{
        console.log("go to details");
    };

    return (
        <>
            <TableRow sx={{
                borderTop:"4px solid #F2F2F2",
                borderBottom: "2px solid #F2F2F2"
            }} 
            key={element.id}>
                { Object.values(sliced).map((value:any, i:number)=>{
                    
                    
                    if(headerNames[i]?.headerTooltip){
                        return (
                            <TableCell
                                key={i}
                                align={headerNames[i]?.align}>
                                {headerNames[i]?.headerTooltip("",sliced.stato,chipBgColor)}              
                            </TableCell>
                        );
                    }else if(headerNames[i]?.gridOpenDetail){
                        return (
                            <TableCell
                                key={i}
                                align={headerNames[i]?.align}>
                                {headerNames[i]?.gridOpenDetail(false,open,setOpen)}              
                            </TableCell>
                        );
                    }else if(headerNames[i]?.gridAction){
                        return (
                            <TableCell
                                key={i}
                                align={headerNames[i]?.align}>
                                {headerNames[i]?.gridAction(handleClickOnGrid,"primary",sliced.stato !== "Elaborato" ? true : false,{idReport:element.reportId})}                
                            </TableCell>
                        );
                    }else{
                        return (
                            
                            <TableCell
                                align={headerNames[i]?.align}>
                                <Typography style={{ fontSize: "1rem", fontWeight: 600 }} variant="caption-semibold">{value}</Typography>   
                            </TableCell>
                        
                        );
                    }
                })
                }
            </TableRow>
            <TableRow >
                <TableCell style={{ paddingBottom: 0, paddingTop: 0}} colSpan={12}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2 , backgroundColor:'#F8F8F8', padding:'10px'}}>
                            <Typography sx={{marginLeft:"6px"}} variant="h6" gutterBottom component="div">
                                {`Moduli commessa ${element.anno}/${element.quarter}`}
                            </Typography>
                            
                            <Table size="small" aria-label="purchases">
                                <TableHead>
                                    <TableRow sx={{borderColor:"white",borderWidth:"thick"}}>
                                        {subHeaderNameModComTrimestraleENTE.map((el,i)=>{
                                            return <TableCell align={el.align} key={i}>{el.label}</TableCell>;
                                        }  
                                        )}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {element.moduli.map(el => {
                                        return(
                                        
                                            <DefaultRow key={element?.id} handleClickOnGrid={handleClickOnGrid} element={el} sliced={el} apiGet={goToDetails}  headerNames={subHeaderNameModComTrimestraleENTE}></DefaultRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        
                           
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
};


export default RowModComTrimestreEnte;


                                
                                
                                  
{/* 
                                    <TableRow>
                                        <TableCell align="center">{mesiGrid[element.mese-1]||''}</TableCell>
                                        <TableCell align="center">{element.anno}</TableCell>
                                        <TableCell align="center">{element.stato||'--'}</TableCell>
                                        <TableCell align="center">{element.dataModifica||'--'}</TableCell>
                                        <TableCell align="center">{element.prodotto||'--'}</TableCell>
                                        <TableCell align="center">{element.totale ||'--'}</TableCell>
                                        <TableCell align="center">{element.totaleDigitale||'--'}</TableCell>
                                        <TableCell align="center">{element.totaleAnalogico ||'--'}</TableCell>
                                    </TableRow>
                                    */}
                        