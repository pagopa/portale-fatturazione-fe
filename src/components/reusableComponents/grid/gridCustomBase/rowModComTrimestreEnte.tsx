import { Box, Collapse, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useState } from "react";
import { mesiGrid, statiContestazione, tipoNotificaArray } from "../../../../reusableFunction/reusableArrayObj";
import DefaultRow from "./rowDefault";


const RowModComTrimestreEnte = ({sliced,headerNames,handleClickOnGrid,element}) => {
    
    const [open, setOpen] = useState(false);
    console.log("dentro1",{sliced,element});

    let bgColorRow = "";
    if(sliced.letto){
        bgColorRow = "#F0FFF0";
    }

    let chipBgColor = "info";
    
    if(sliced.stato === "Presa in carico"){
        chipBgColor = "info";
    }else if(sliced.stato === "Elaborato"){
        chipBgColor = "success";
    }else if(sliced.stato === "Elaborato no data"){
        chipBgColor ="warning";
    }else if(sliced.stato === "Errore"){
        chipBgColor = "error";
    }


    const handleClickOnSingleEl = () =>{
        console.log("click");
    };


    const goToDetails = () =>{
        console.log("go to details");
    };

    return (
        <>
            <TableRow sx={{
                borderTop:"4px solid #F2F2F2",
                borderBottom: "2px solid #F2F2F2",
                backgroundColor:bgColorRow
            }} 
            key={element.id}>
                { Object.values(sliced).map((value:any, i:number)=>{
                    const indexLetto =  Object.entries(sliced).findIndex(([key]) => key === 'letto');
                    let titleTooltip = value;
                    let customValue = value;
                    if(i === indexLetto){
                        let color = "green";
                        titleTooltip = "Letto";
                        if(!value){
                            titleTooltip = "Non letto";
                            color = "#d9d9d9";
                        }
                        customValue = <CheckCircleOutlineIcon sx={{color:color}}/>;
                    }
                    
                    if(value === "--" || typeof(value) === "boolean"){
                        return (
                            <TableCell
                                key={i}
                                align={headerNames[i]?.align}>
                                {customValue} 
                            </TableCell>
                        );
                    }else if(headerNames[i]?.headerTooltip){
                        return (
                            <TableCell
                                key={i}
                                align={headerNames[i]?.align}>
                                {headerNames[i]?.headerTooltip(titleTooltip,customValue,chipBgColor)}              
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
                            <Tooltip key={Math.random()} title={titleTooltip}  placement="right">
                                <TableCell
                                    align={headerNames[i]?.align}>
                                    <Typography style={{ fontSize: "1rem", fontWeight: 600 }} variant="caption-semibold">{customValue}</Typography>   
                                </TableCell>
                            </Tooltip>
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
          Moduli commessa Trimestre X
                            </Typography>
                            <Table size="small" aria-label="purchases">
                                <TableHead>
                                    <TableRow sx={{borderColor:"white",borderWidth:"thick"}}>
                                        <TableCell align="center" >Mese</TableCell>
                                        <TableCell align="center"  >Anno</TableCell>
                                        <TableCell align="center" >Stato</TableCell>
                                        <TableCell align="center" >Data modifica</TableCell>
                                        <TableCell align="center" >Prodotto</TableCell>
                                        <TableCell align="center" >Totale</TableCell>
                                        <TableCell align="center" >Tot. Digit.</TableCell>
                                        <TableCell align="center" >Tot. Analog.</TableCell>
                                      
                                     
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {element.moduli.map(el => {
                                        return(
                                        
                                            <DefaultRow handleClickOnGrid={handleClickOnSingleEl} element={el} sliced={el} apiGet={goToDetails} nameParameterApi={"test"} ></DefaultRow>
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
                        