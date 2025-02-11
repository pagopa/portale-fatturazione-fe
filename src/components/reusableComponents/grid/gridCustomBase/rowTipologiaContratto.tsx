import { Switch, TableCell, TableRow, Tooltip, Typography } from "@mui/material";
import { useEffect, useState } from "react";


const RowContratto = ({sliced, apiGet, handleClickOnGrid, element}) => {
    const [tipologia,setTipologia] = useState(element.tipoContratto);

    useEffect(()=>{
        setTipologia(element.tipoContratto);
    },[element]);

    return (
        <TableRow key={element.idEnte}>
            {
                Object.values(sliced).map((value:any, i:number)=>{
                    const indexContractType =  Object.entries(sliced).findIndex(([key]) => key === 'tipoContratto');
                    // stato per loa switch utilizzato nella page tipologia contratto
                    const cssFirstColum = i === 0 ? {color:'#0D6EFD', fontWeight: 'bold', cursor: 'pointer'} : null;
                    const valueEl = (i === 0 && value?.toString().length > 50) ? value?.toString().slice(0, 50) + '...' : value;
                
                    if(i === indexContractType){
                        return(
                            apiGet &&  <TableCell key={Math.random()} sx={{display:'flex'}}> <Typography>PAC</Typography><Switch onChange={() =>{
                                //setContractType((prev)=> !prev);
                                setTipologia((prev)=> prev === 1 ? 2 : 1);
                                handleClickOnGrid(element);
                            } } checked={tipologia === 1 ? true : false }/><Typography>PAL</Typography></TableCell>
                        );
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

export  default RowContratto;