import { Box, Collapse, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useEffect, useState } from "react";

import DefaultRow from "./rowDefault";
import is from "date-fns/esm/locale/is/index.js";
import { useNavigate } from "react-router";
import ModalRedirect from "../../../commessaInserimento/madalRedirect";
import ModalInfo from "../../modals/modalInfo";
import { PathPf } from "../../../../types/enum";
import GridCustom from "../gridCustom";
import { subHeaderNameModComTrimestraleENTE } from "../../../../assets/configurations/config_SubGridModComEnte";


const RowModComTrimestreEnte = ({sliced,headerNames,handleClickOnGrid,element, mandatoryEl}) => {
  
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [openModalModObbligatori,setOpenModalModObbligatori] = useState({open:false,sentence:''});
    

    const isOpenOnStart = element.moduli.filter(el => el.source === "obbligatorio").length > 0;

    useEffect(()=>{
        isOpenOnStart && setOpen(true);
    },[isOpenOnStart]);


    let chipBgColor = "#A2ADB8";
    
    if(sliced.stato === "Completo"){
        chipBgColor = "#6CC66A";
    }


    const handleClickOnSingleEl = (el) =>{
    
        if(mandatoryEl && el.source !== "obbligatorio" && el.source !== "archiviato" ){
            setOpenModalModObbligatori({open:true,sentence:'Per inserire i moduli commessa futuri bisogna prima inserire i moduli commessa OBBLIGATORI'});
        }else{
            navigate(PathPf.MODULOCOMMESSA);
        }
       
    };


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
                                        
                                            <DefaultRow handleClickOnGrid={handleClickOnSingleEl} element={el} sliced={el} apiGet={goToDetails} nameParameterApi={"test"} headerNames={subHeaderNameModComTrimestraleENTE}></DefaultRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        
                           
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
            <ModalInfo 
                setOpen={setOpenModalModObbligatori}
                open={openModalModObbligatori}></ModalInfo>
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
                        