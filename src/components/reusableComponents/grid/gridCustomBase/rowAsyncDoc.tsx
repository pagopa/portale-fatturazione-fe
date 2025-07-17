import { Box, Collapse, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useState } from "react";
import { mesiGrid, statiContestazione, tipoNotificaArray } from "../../../../reusableFunction/reusableArrayObj";


const RowAsyncDoc = ({sliced,headerNames,handleClickOnGrid,element}) => {

    function keysToLowerCase(obj: any): any {
        if (Array.isArray(obj)) {
            return obj.map(keysToLowerCase);
        } else if (obj !== null && typeof obj === 'object') {
            return Object.fromEntries(
                Object.entries(obj).map(([key, value]) => [key.toLowerCase(), keysToLowerCase(value)])
            );
        }
        return obj;
    }
    
    const [open, setOpen] = useState(false);
    const {DETTAGLIO,...rest} = sliced;
    const dettaglioParsed = keysToLowerCase(JSON.parse(DETTAGLIO));
    const stringsStatiContest = dettaglioParsed?.statoContestazione?.map(el => statiContestazione[el]).join(' , ');
    console.log({sliced,dettaglioParsed});
    let bgColorRow = "";
    if(sliced.letto){
        bgColorRow = "#F0FFF0";
    }

    let chipBgColor = "#E3E7EB";
    
    if(sliced.stato === "Presa in carico"){
        chipBgColor = "#86E1FD";
    }else if(sliced.stato === "Elaborato"){
        chipBgColor = "#B5E2B4";
    }else if(sliced.stato === "Elaborato no data"){
        chipBgColor ="#FFE5A3";
    }else if(sliced.stato === "Errore"){
        chipBgColor = "#FB9EAC";
    }

    return (
        <>
            <TableRow sx={{
                borderTop:"4px solid #F2F2F2",
                borderBottom: "2px solid #F2F2F2",
                backgroundColor:bgColorRow
            }} 
            key={element.idReport}>
                { Object.values(rest).map((value:any, i:number)=>{
                    const indexLetto =  Object.entries(rest).findIndex(([key]) => key === 'letto');
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
          Filtri applicati
                            </Typography>
                            <Table size="small" aria-label="purchases">
                                <TableHead>
                                    <TableRow sx={{borderColor:"white",borderWidth:"thick"}}>
                                        <TableCell align="center"  >Anno</TableCell>
                                        <TableCell align="center" >Mese</TableCell>
                                        <TableCell align="center" >Tipo Notifica</TableCell>
                                        <TableCell align="center" >CAP</TableCell>
                                        <TableCell align="center" >IUN</TableCell>
                                        <TableCell align="center" >Stato Contestazione</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody sx={{borderColor:"white",borderWidth:"thick"}}>
                                    <TableRow>
                                        <TableCell align="center">{dettaglioParsed.anno}</TableCell>
                                        <TableCell align="center">{mesiGrid[dettaglioParsed.mese]||''}</TableCell>
                                        <TableCell align="center">{tipoNotificaArray[dettaglioParsed?.tipoNotifica-1]||'--'}</TableCell>
                                        <TableCell align="center">{dettaglioParsed.cap||'--'}</TableCell>
                                        <TableCell align="center">{dettaglioParsed.iun||'--'}</TableCell>
                                        <TableCell align="center">{stringsStatiContest ||'--'}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
};

export default RowAsyncDoc;