import { Switch, TableCell, TableRow, Tooltip, Typography } from "@mui/material";
import { Box, width } from "@mui/system";
import { useEffect, useState } from "react";


const RowContratto = ({sliced, apiGet, handleClickOnGrid, element}) => {
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
                Object.values(sliced).map((value:any, i:number)=>{
                    const indexContractType =  Object.entries(sliced).findIndex(([key]) => key === 'tipoContratto');
                    // stato per loa switch utilizzato nella page tipologia contratto
                    const cssFirstColum = i === 0 ? {color:'#0D6EFD', fontWeight: 'bold', cursor: 'pointer',width:"350px"} : null;
                    const valueEl = (i === 0 && value?.toString().length > 50) ? value?.toString().slice(0, 47) + '...' : value;
                
                    if(i === indexContractType){
                        return(
                            apiGet &&  <TableCell key={Math.random()} align="center"> <Box 
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",  
                                    gap: 1}}><Typography>PAC</Typography><Switch onChange={() =>{
                                    setTipologia((prev)=> prev === 1 ? 2 : 1);
                                    handleClickOnGrid(element);
                                } } checked={tipologia === 1 ? true : false }/><Typography>PAL</Typography></Box></TableCell>
                        );
                    }else{
                        return (
                            <Tooltip key={Math.random()} title={value !== "--" ? value :null}>
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