import { Switch, TableCell, TableRow, Tooltip, Typography } from "@mui/material";
import { useState } from "react";

const GridRowContratto = ({sliced, apiGet, handleClickOnGrid, element}) => {
  
    return (
        <TableRow key={Math.random()}>
            {
                Object.values(sliced).map((value:any, i:number)=>{
                    const indexContractType =  Object.entries(sliced).findIndex(([key]) => key === 'tipoContratto');
                    // stato per loa switch utilizzato nella page tipologia contratto
                    const cssFirstColum = i === 0 ? {color:'#0D6EFD', fontWeight: 'bold', cursor: 'pointer'} : null;
                    const valueEl = (i === 0 && value?.toString().length > 50) ? value?.toString().slice(0, 50) + '...' : value;
                
                    if(i === indexContractType){
                        {return(
                            apiGet &&  <TableCell sx={{display:'flex'}}> <Typography>PAC</Typography><Switch onChange={() =>{
                                //setContractType((prev)=> !prev);
                                handleClickOnGrid(element);
                            } } checked={element.tipoContratto === 1 ? true : false }/><Typography>PAL</Typography></TableCell>
                        );}
                    }else{
                        return (
                            <Tooltip key={Math.random()} title={value}>
                                <TableCell sx={cssFirstColum}>
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

export  default GridRowContratto;