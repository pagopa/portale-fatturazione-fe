import { Alert, Box, Chip, IconButton, Snackbar, Switch, SxProps, TableCell, TableCellProps, TableRow, Theme, Tooltip, Typography } from "@mui/material";
import { HeaderGridCustom } from "../gridCustom";
import { mesiGrid } from "../../../../reusableFunction/reusableArrayObj";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import dayjs from "dayjs";
import { useState } from "react";
import ArticleIcon from '@mui/icons-material/Article';



interface GridRowsRendererProps<T = any>{
  element: any;
  sliced: any;
  nameParameterApi: string;
  apiGet?: (el: any) => void;
  headerNames:HeaderGridCustom[];
  headerNamesCollapse?: string[] | { label: string; align: TableCellProps['align']; width: number | string }[];
  selected?: number[];
  setSelected?: React.Dispatch<React.SetStateAction<number[]>>;
  checkIfChecked?: (id: any) => boolean;
  setOpenModalAction?: (obj:T, action:string) => void;
}

const flexCenterStyle: SxProps<Theme> = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: 1,
};

const cssFirstColumRagioneSociale : SxProps<Theme> = {
  color:'#0D6EFD',
  fontWeight: 'bold',
  cursor: 'pointer',
  width:"350px"
};

const cssFirstColum : SxProps<Theme> = {
  color:'#0D6EFD',
  fontWeight: 'bold',
  cursor: 'pointer',
};





const GridRowDesignByConfigFile =  ({
  element,
  sliced,
  nameParameterApi,
  apiGet,
  headerNames,
  headerNamesCollapse,
  selected,
  setSelected,
  checkIfChecked,
  setOpenModalAction
}: GridRowsRendererProps) => {
  console.log({element});



  return (

    <TableRow sx={{
      height: '80px',
      borderTop: '4px solid #F2F2F2',
      borderBottom: '2px solid #F2F2F2',
      '&:hover': {
        backgroundColor: '#EDEFF1',
      },
    }}>
        
      {Object.values(headerNames).map((rowObject:HeaderGridCustom, i:number)=>{
        console.log({rowObject});

        
        switch (rowObject.typeColumn) {
        case 'string':
          return  (
            <Tooltip key={`${i}-${element[rowObject.keyValue]}`} title={(element[rowObject.keyValue]?.toString().length > 20) ? element[rowObject.keyValue]:null}>
              <TableCell  onClick={() => {if(apiGet && headerNames[i]?.makeAction) apiGet(element);}} align="center" sx={headerNames[i]?.makeAction ? cssFirstColum:null}>
                {element[rowObject.keyValue]
                  ? element[rowObject.keyValue].toString().length > 20
                    ? element[rowObject.keyValue].toString().slice(0, 10) + '...'
                    : element[rowObject.keyValue]
                  : "--" }
              </TableCell>
            </Tooltip>
          );
        case 'number':
          return   (
            <TableCell align="center" >
              {element[rowObject.keyValue] === null ? "--" : element[rowObject.keyValue]}
            </TableCell>
          );
        case 'boolean':
          return   (
            <TableCell align="center" >
              {element[rowObject.keyValue] === null ? "--" : element[rowObject.keyValue] === true ?"Si" : "No"}
            </TableCell>
          );
        case 'mese-number':
          return   (
            <TableCell align="center" >
              {mesiGrid[element[rowObject.keyValue]]||"--"}
            </TableCell>
          );
        case 'ragionesociale':
          return  (
            <Tooltip key={`${i}-${element[rowObject.keyValue]}`} title={(element[rowObject.keyValue]?.toString().length > 40) ? element[rowObject.keyValue]:null}>
              <TableCell onClick={() => {if(apiGet && headerNames[i]?.makeAction ) apiGet(element);}}  align={i === 0 ? "left" : "center"} sx={headerNames[i]?.applyCss ? cssFirstColumRagioneSociale:null}>
                {( element[rowObject.keyValue]?.toString().length > 40) ? element[rowObject.keyValue]?.toString().slice(0, 37) + '...' : element[rowObject.keyValue]}
              </TableCell>
            </Tooltip>);
        case 'data':{

          let valueData = dayjs(element[rowObject.keyValue]).format("YYYY-MM-DD");
          if(rowObject.keyValue === "dataChiusura"){
            valueData = element.source === "archiviato" ? "--" : element.source === "facoltativo" ? "TBD" : dayjs(element.dataChiusura).format("YYYY-MM-DD");
          }

          return (  
            <TableCell key={`${i}-${element[rowObject.keyValue]}`}  align="center">
              { valueData||'--'}
            </TableCell>);
        }
        case 'number-tipocontratto':{
          return (  
            <TableCell key={`${i}-${element[rowObject.keyValue]}`}  align="center">
              { element[rowObject.keyValue] === null ? '--' : Number(element[rowObject.keyValue]) === 1 ? "PAL":"PAC"}
            </TableCell>);
        }
        case 'data-ora':{

          const valueData = element[rowObject.keyValue].replace("T", " ").substring(0, 19);
        
          return (  
            <TableCell key={`${i}-${element[rowObject.keyValue]}`}  align="center">
              { valueData||'--'}
            </TableCell>);
        }
        case 'euro-centesimi':
          return(
            <TableCell key={`${i}-${element[rowObject.keyValue]}`}  align="center">
              { (Number(element[rowObject.keyValue]) / 100).toLocaleString("de-DE", { style: "currency", currency: "EUR" })||'--'}
            </TableCell>
          );
        case 'euro':
          return(
            <TableCell key={`${i}-${element[rowObject.keyValue]}`}  align="center">
              { (Number(element[rowObject.keyValue])).toLocaleString("de-DE", { style: "currency", currency: "EUR" })||'--'}
            </TableCell>
          );
        case 'switch':
          return   (
            <TableCell key={`${i}-${element[rowObject.keyValue]}`} align="center"> 
              <Box sx={flexCenterStyle}>
                <Typography>{rowObject.switchValue && rowObject.switchValue[0].valueSwitch}</Typography>
                <Switch onChange={() =>{if (apiGet)  apiGet(element); } } checked={element.tipoContratto === 1 ? true : false }/>
                <Typography>{rowObject.switchValue && rowObject.switchValue[1].valueSwitch}</Typography>
              </Box>
            </TableCell>);
        case 'checkbox':
          return   <h1>checkbox</h1>;
        case 'chip':
          return (
            <TableCell width={rowObject.width} align="center">
              <Chip variant="outlined" label={ element[rowObject.keyValue]?.charAt(0)?.toUpperCase() + element[rowObject.keyValue]?.slice(1)?.toLowerCase()} sx={{backgroundColor:(rowObject.funToManipulateValue && rowObject.keyToManipulateData)? rowObject.funToManipulateValue(element[rowObject.keyToManipulateData]) : undefined}} />
            </TableCell>
          );
        case 'snackbar':
        {
          const [open, setOpen] = useState(false);
          const handleCopy = () => {
            navigator.clipboard.writeText(element[rowObject.keyValue]);
            setOpen(true);
          };
          return (
            <TableCell
              key={i}
              align={headerNames[i]?.align}> 
              <Tooltip  title={element[rowObject.keyValue]}>
                <IconButton onClick={handleCopy}>
                  <ArticleIcon sx={{color:"default"}} fontSize="small" />
                </IconButton>
              </Tooltip>
              <Snackbar
                open={open}
                onClose={() => setOpen(false)}
                autoHideDuration={2000}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
              ><Alert 
                  onClose={() => setOpen(false)} 
                  severity="success" 
                >Event ID Copiato!
                </Alert>
              </Snackbar>           
            </TableCell>
          );
        }
          
        case 'collaps':
          return   <h1>collapse</h1>;
        case 'arrow':
          return  (
            <TableCell align="center">
              <IconButton
                size="medium"
                onClick={() => {if(apiGet) apiGet(element);}}
              > <ArrowForwardIcon sx={{ color: '#1976D2', cursor: 'pointer' }}/>
              </IconButton>
            </TableCell>
          );
        default:
          return null;
        }
      })}
    </TableRow>
  );
};


export default  GridRowDesignByConfigFile;