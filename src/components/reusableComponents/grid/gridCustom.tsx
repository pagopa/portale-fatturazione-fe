import { Card, IconButton, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, Tooltip } from "@mui/material";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { GridElementListaPsp } from "../../../types/typeAngraficaPsp";
import { Rel } from "../../../types/typeRel";
import { NotificheList } from "../../../types/typeReportDettaglio";
import { ContestazioneRowGrid } from "../../../page/prod_pn/storicoContestazioni";
import RowContratto from "./gridCustomBase/rowTipologiaContratto";
import RowWhiteList from "./gridCustomBase/rowWhiteList";
import EnhancedTableCustom from "./gridCustomBase/enhancedTabalToolbarCustom";
import { SetStateAction } from "react";
import { Whitelist } from "../../../page/whiteList";
import { DataGridOrchestratore } from "../../../page/processiOrchestratore";
import RowOrchestratore from "./gridCustomBase/rowOrchestratore";
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import RowContestazioni from "./gridCustomBase/rowContestazioni";

export interface GridCustomProps {
    elements:NotificheList[]|Rel[]|GridElementListaPsp[]|ContestazioneRowGrid[]|any[]
    changePage:(event: React.MouseEvent<HTMLButtonElement> | null,newPage: number) => void
    changeRow:( event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
    page:number
    total:number
    rows:number
    headerNames:string[]|{label:string,align:string,width:number|string}[],
    nameParameterApi:string 
    apiGet?:(el:any)=>void 
    disabled:boolean
    widthCustomSize:string
    setOpenModalDelete?:React.Dispatch<SetStateAction<boolean>>
    setOpenModalAdd?:React.Dispatch<SetStateAction<boolean>>
    selected?:number[]
    setSelected?:React.Dispatch<SetStateAction<number[]>>
    buttons?:{
        stringIcon:string
        icon:React.ReactNode
        action:string
    }[],
    headerAction?:(val:any) =>void,
    body?:any
}


const GridCustom : React.FC<GridCustomProps> = ({
    elements,
    changePage,
    changeRow,
    page,
    total,
    rows,
    headerNames,
    nameParameterApi,
    apiGet,
    disabled,
    widthCustomSize,
    setOpenModalDelete,
    setOpenModalAdd,
    buttons,
    selected,
    setSelected,
    headerAction,
    body
}) =>{

    const handleClickOnGrid = (element) =>{
        if(apiGet && nameParameterApi === 'idContratto'){
            const newDetailRel = {
                name:element.ragioneSociale,
                tipologiaContratto:element.tipoContratto,
                idEnte:element.idEnte
            };
            apiGet(newDetailRel);

        }else if(apiGet && nameParameterApi === 'contestazionePage'){
            const newDetail = {
                id:element.reportId
            };
            apiGet(newDetail);
        }else if(apiGet){
            const newDetail = {
                nomeEnteClickOn:element.ragioneSociale,
                mese:element.mese,
                anno:element.anno,
                id:element[nameParameterApi]
            };
            apiGet(newDetail);
        }
    };

    const checkIfChecked = (id:any) => {
        if(selected){
            return selected.includes(id);
        }  
    };
    
    return (
        <div>
            {nameParameterApi === "idWhite" && <EnhancedTableCustom  setOpenModal={setOpenModalDelete} setOpenModalAdd={setOpenModalAdd} selected={selected||[]} buttons={buttons} ></EnhancedTableCustom>}
            <div style={{overflowX:'auto'}}>
                <Card sx={{width: widthCustomSize}}  >
                    <Table >
                        <TableHead sx={{backgroundColor:'#f2f2f2'}}>
                            <TableRow>
                                {headerNames.map((el,i)=>{
                                    if(nameParameterApi === 'idOrchestratore'){
                                        return(
                                            <TableCell key={Math.random()} align={el.align} width={el.width}>{el.label}
                                                {el.headerAction &&
                                                <Tooltip title="Sort">
                                                    <IconButton disabled={ total === 0 ? true : false} sx={{marginLeft:'10px'}}  onClick={()=> headerAction && headerAction((body?.ordinamento === 0) ? 1:0)}  size="small">
                                                        {(body?.ordinamento === 0) ? <ArrowUpwardIcon></ArrowUpwardIcon>:<ArrowDownwardIcon></ArrowDownwardIcon>}
                                                    </IconButton>
                                                </Tooltip>}
                                            </TableCell>
                                        );
                                    }else{
                                        return <TableCell key={Math.random()}>{el}</TableCell>;
                                    }  
                                })}
                            </TableRow>
                        </TableHead>
                        {elements.length === 0 ?
                            <TableBody key={Math.random()} style={{height: '50px'}}>
                            </TableBody> :
                            <TableBody sx={{marginLeft:'20px'}}>
                                {elements.map((element:Rel|NotificheList|GridElementListaPsp|Whitelist|DataGridOrchestratore|ContestazioneRowGrid ) =>{
                                    // tolgo da ogni oggetto la prima chiave valore  perchè il cliente non vuole vedere es. l'id ma serve per la chiamata get di dettaglio 
                                    let sliced = Object.fromEntries(
                                        Object.entries(element).slice(1)
                                    );
                                    if(nameParameterApi === 'idWhite'){
                                        sliced = Object.fromEntries(Object.entries(element).slice(1, -1));
                                    }else if(nameParameterApi === "contestazionePage"){
                                        sliced = Object.fromEntries(Object.entries(element).slice(1, -1));
                                    }
                                    if(nameParameterApi === 'idContratto'){
                                        return <RowContratto key={Math.random()} sliced={sliced} apiGet={apiGet} handleClickOnGrid={handleClickOnGrid} element={element} ></RowContratto>;
                                    }else if(nameParameterApi === 'idWhite'){
                                        return <RowWhiteList key={Math.random()} sliced={sliced} apiGet={apiGet} handleClickOnGrid={handleClickOnGrid} element={element} setSelected={setSelected} selected={selected||[]}  checkIfChecked={checkIfChecked} ></RowWhiteList>;
                                    }else if(nameParameterApi === 'idOrchestratore'){
                                        return <RowOrchestratore key={Math.random()} sliced={sliced} headerNames={headerNames}></RowOrchestratore>;
                                    }else if(nameParameterApi === "contestazionePage"){
                                        return <RowContestazioni key={Math.random()} sliced={sliced}apiGet={apiGet} handleClickOnGrid={handleClickOnGrid} element={element}></RowContestazioni>;
                                    }else{
                                        return (
                                            <TableRow key={Math.random()}>
                                                {
                                                    Object.values(sliced).map((value:string|number, i:number)=>{
                                                        const cssFirstColum = i === 0 ? {color:'#0D6EFD', fontWeight: 'bold', cursor: 'pointer'} : null;
                                                        const valueEl = (i === 0 && value?.toString().length > 50) ? value?.toString().slice(0, 50) + '...' : value;
                                                        return (
                                                            <Tooltip key={Math.random()} title={value}>
                                                                <TableCell
                                                                    sx={cssFirstColum} 
                                                                    onClick={()=>{
                                                                        if(i === 0){
                                                                            handleClickOnGrid(element);
                                                                        }            
                                                                    }}
                                                                >
                                                                    {valueEl}
                                                                </TableCell>
                                                            </Tooltip>
                                                        );
                                                    })
                                                }
                                                {apiGet && <TableCell align="center" onClick={()=>{handleClickOnGrid(element);}}>
                                                    <ArrowForwardIcon sx={{ color: '#1976D2', cursor: 'pointer' }} /> 
                                                </TableCell> }
                                            </TableRow>
                                        );}
                                } )}
                            </TableBody>
                        }
                    </Table>      
                </Card>
            </div>
            <div className="pt-3">                           
                <TablePagination
                    sx={{'.MuiTablePagination-selectLabel': {
                        display:'none',
                        backgroundColor:'#f2f2f2'
                                                
                    }}}
                    component="div"
                    page={total > 0 ? page:0}
                    count={total}
                    rowsPerPage={rows}
                    onPageChange={changePage}
                    onRowsPerPageChange={changeRow}
                ></TablePagination>
            </div>
        </div>
        
    );
};

export default GridCustom;
