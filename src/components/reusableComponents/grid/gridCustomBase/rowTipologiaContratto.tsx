import { Switch, TableCell, TableRow, Tooltip, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useEffect, useState } from "react";
import { TipologiaContrattoConfig } from "../../../../assets/configurations/conf_GridTipologia";


const RowContratto = ({ apiGet, element, headerNames}: { apiGet:any; element: any; headerNames: TipologiaContrattoConfig[] }) => {
  const [tipologia,setTipologia] = useState(element.tipoContratto);

  useEffect(()=>{
    setTipologia(element.tipoContratto);
  },[element]);

  return (
    <TableRow sx={{
      height: '80px',
      borderTop: '4px solid #F2F2F2',
      borderBottom: '2px solid #F2F2F2',
      '&:hover': {
        backgroundColor: '#EDEFF1',
      },
    }}   key={element.idEnte}>
      {
        Object.values(headerNames).map((value:TipologiaContrattoConfig, i:number)=>{
         
          //const indexContractType =  Object.entries(sliced).findIndex(([key]) => key === 'tipoContratto');
          // stato per loa switch utilizzato nella page tipologia contratto
          const cssFirstColum = i === 0 ? {color:'#0D6EFD', fontWeight: 'bold', cursor: 'pointer',width:"350px"} : null;
          const valueEl = (i === 0 && element[value["keyValue"]]?.toString().length > 50) ? element[value["keyValue"]]?.toString().slice(0, 47) + '...' : element[value["keyValue"]];
        
          if(value["keyValue"] === "tipoContratto"){
        
            return(
              apiGet &&  <TableCell key={Math.random()} align="center"> <Box 
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",  
                  gap: 1}}><Typography>PAC</Typography><Switch onChange={() =>{
                  setTipologia((prev)=> prev === 1 ? 2 : 1);
                  
                  const  newDetail = {
                    name:element.ragioneSociale,
                    tipologiaContratto:element.tipoContratto,
                    idEnte:element.idEnte
                  };
                  apiGet(newDetail);
                } } checked={tipologia === 1 ? true : false }/><Typography>PAL</Typography></Box></TableCell>
            );
          }else{
            return (
              <Tooltip key={Math.random()} title={element[value["keyValue"]] !== "--" ? element[value["keyValue"]] :null}>
                <TableCell  align={i === 0 ? "left" : "center"} sx={cssFirstColum}>
                  {valueEl}
                </TableCell>
              </Tooltip>
            );
          }
        })
      }
    </TableRow>
  );
};

export  default RowContratto;