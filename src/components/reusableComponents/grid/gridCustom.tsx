import { Card, IconButton, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, Tooltip, Typography } from "@mui/material";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { GridElementListaPsp } from "../../../types/typeAngraficaPsp";
import { Rel } from "../../../types/typeRel";
import { NotificheList } from "../../../types/typeReportDettaglio";
import { ContestazioneRowGrid } from "../../../page/prod_pn/storicoContestazioni";
import RowContratto from "./gridCustomBase/rowTipologiaContratto";
import RowWhiteList from "./gridCustomBase/rowWhiteList";
import EnhancedTableCustom from "./gridCustomBase/enhancedTabalToolbarCustom";
import { SetStateAction } from "react";
import RowOrchestratore from "./gridCustomBase/rowOrchestratore";
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { DataGridAsyncDoc } from "../../../page/ente/asyncDocumenti";
import RowAsyncDoc from "./gridCustomBase/rowAsyncDoc";
import RowContestazioni from "./gridCustomBase/rowContestazioni";
import { DataGridOrchestratore } from "../../../page/prod_pn/processiOrchestratore";
import { Whitelist } from "../../../page/prod_pn/whiteList";
import DefaultRow from "./gridCustomBase/rowDefault";
import RowModCommessaPrevisionale from "./gridCustomBase/rowModCommessaPrevisonale";
import RowCollapsible from "./gridCustomBase/rowCollapsible";
interface GridCustomProps {
    elements:NotificheList[]|Rel[]|GridElementListaPsp[]|ContestazioneRowGrid[]|any
    changePage:(event: React.MouseEvent<HTMLButtonElement> | null,newPage: number) => void,
    changeRow:( event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void,
    page:number,
    total:number,
    rows:number,
    headerNames:string[]|{label:string,align:string,width:number|string}[],
    headerNamesCollapse?:string[]|{label:string,align:string,width:number|string}[],
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
    headerAction?:(val:number) =>void,
    body?:any,
    paginationVisibile?:boolean,
    objectSort?:{[key:string]:number},
    sentenseEmpty?:string,
    headerAction2?:(val:string, setGridData:React.Dispatch<SetStateAction<any[]>>,val2:boolean,setObjet:React.Dispatch<SetStateAction<{[key:string]:number}>>,p:number,r:number) =>void,
    setGridData?:React.Dispatch<SetStateAction<any[]>>
    gridType?:boolean,
    setObjectSort?:React.Dispatch<SetStateAction<{[key:string]:number}>>
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
    body,
    paginationVisibile,
    headerNamesCollapse,
    objectSort,
    sentenseEmpty,
    setGridData,
    gridType,
    headerAction2,
    setObjectSort
}) =>{

    const handleClickOnGrid = (element) =>{
      
        if(apiGet && nameParameterApi === 'idContratto'){
            const  newDetail = {
                name:element.ragioneSociale,
                tipologiaContratto:element.tipoContratto,
                idEnte:element.idEnte
            };
            apiGet(newDetail);
        }else if(apiGet && nameParameterApi ==='asyncDocEnte'){
            const  newDetail = {
                idReport:element?.idReport,
            };
            apiGet(newDetail);
        }else if(apiGet && nameParameterApi === 'contestazionePage'){
            const newDetail = {
                id:element.reportId
            };
            apiGet(newDetail);
            //modComTrimestrale
        }else if(apiGet && (nameParameterApi === 'modComTrimestrale'|| nameParameterApi === "docEmessiEnte" )){
            apiGet(element);
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

    /*else if(apiGet && nameParameterApi === 'modComTrimestrale'){
            const newDetail = {
                id:element.id
            };
            apiGet(newDetail);
        } */

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
                                    let sortValue = 0;
                                    if(objectSort && objectSort[el.label] === 1){
                                        sortValue = Number(objectSort[el.label]);
                                    }else if(objectSort && objectSort[el.label] === 2){
                                        sortValue = Number(objectSort[el.label]);
                                    }else if(objectSort && objectSort[el.label] === 3){
                                        sortValue = Number(objectSort[el.label]);
                                    }
                                    //TODO : da sistemare nel file di configurazione come fatto con doc emessi , doc sospesi ente 06/02/26
                                    if(nameParameterApi === 'idOrchestratore' || nameParameterApi === "asyncDocEnte"|| nameParameterApi === "idPrevisonale" ){ //|| nameParameterApi === "modComTrimestrale"
                                        return(
                                            <TableCell key={Math.random()} align={el.align} width={el.width}>{el.label}
                                                {el.headerAction &&
                                                <Tooltip title="Sort">
                                                    <span>
                                                        <IconButton disabled={ total === 0 ? true : false} sx={{marginLeft:'10px'}}  onClick={()=> headerAction && headerAction((body?.ordinamento === 0) ? 1:0)}  size="small">
                                                            {(body?.ordinamento === 0) ? <ArrowUpwardIcon></ArrowUpwardIcon>:<ArrowDownwardIcon></ArrowDownwardIcon>}
                                                        </IconButton>
                                                    </span>
                                                   
                                                </Tooltip>}
                                            </TableCell>
                                        );
                                    }else if(nameParameterApi === 'contestazionePage'|| nameParameterApi === "modComTrimestrale" || nameParameterApi === "docEmessiEnte"|| nameParameterApi === "docEmessiEnteContestate"){
                                        return(
                                            <TableCell key={Math.random()} align={el.align} width={el.width}>{el.label}</TableCell>
                                        );
                                    }else if(nameParameterApi === "docEmessiEnte_mock"){
                                        return(
                                            <TableCell key={`tableCell-${i}`} align={el.align} width={el.width}>{el.label}
                                                {(el.headerActionSort &&  objectSort && objectSort[el.label]) &&
                                                <Tooltip title="Sort">
                                                    <span>
                                                        <IconButton disabled={ (total === 0 ||elements.length === 0) ? true : false} sx={{marginLeft:'10px'}}  onClick={()=> (headerAction2 && setGridData && gridType && setObjectSort) && headerAction2(el.label,setGridData,gridType,setObjectSort,page,rows)}  size="small">
                                                            {(sortValue === 1) ? <ArrowUpwardIcon sx={{ color: 'text.disabled'}}></ArrowUpwardIcon> :
                                                                (sortValue === 2) ? <ArrowUpwardIcon></ArrowUpwardIcon>:
                                                                    <ArrowDownwardIcon></ArrowDownwardIcon>}
                                                        </IconButton>
                                                    </span>
                                                   
                                                </Tooltip>}
                                            </TableCell>
                                        );
                                    }else{
                                        return <TableCell key={`tableCell-${i}`} align="center">{el}</TableCell>;
                                    }  
                                })}
                            </TableRow>
                        </TableHead>
                        
                        <TableBody sx={{marginLeft:'20px',height: '50px'}}>
                            {elements.length === 0 && nameParameterApi === "docEmessiEnte" && 
                            <TableRow key={"no-data"}>
                                <TableCell colSpan={100} align="left">
                                    <Typography fontWeight={"bold"}>{sentenseEmpty && sentenseEmpty}</Typography>
                                </TableCell>
                            </TableRow>
                            }
                            {elements.length > 0 && elements.map((element:Rel|NotificheList|GridElementListaPsp|Whitelist|DataGridOrchestratore|DataGridAsyncDoc|ContestazioneRowGrid|any ) =>{
                                // tolgo da ogni oggetto la prima chiave valore  perchè il cliente non vuole vedere es. l'id ma serve per la chiamata get di dettaglio 
                                let sliced = Object.fromEntries(
                                    Object.entries(element).slice(1)
                                );
                                if(nameParameterApi === 'idWhite'){
                                    sliced = Object.fromEntries(Object.entries(element).slice(1, -1));
                                }else if(nameParameterApi === "contestazionePage"){
                                    sliced = Object.fromEntries(Object.entries(element).slice(1, -1));
                                }else if(nameParameterApi === "modComTrimestrale"){
                                    sliced = Object.fromEntries(Object.entries(element).slice(1, -4));
                                }else if( nameParameterApi === "idPrevisonale"){
                                    sliced = Object.fromEntries(Object.entries(element).slice(5));
                                }else if(nameParameterApi === "docEmessiEnte"){
                                    sliced = Object.fromEntries(Object.entries(element).slice(3, -1));
                                }else if(nameParameterApi === "docEmessiEnteContestate"){
                                    sliced = Object.fromEntries(Object.entries(element).slice(4, -2));
                                }


                                if(nameParameterApi === 'idContratto'){
                                    return <RowContratto key={Math.random()} sliced={sliced} apiGet={apiGet} handleClickOnGrid={handleClickOnGrid} element={element} ></RowContratto>;
                                }else if(nameParameterApi === 'idWhite'){
                                    return <RowWhiteList key={Math.random()} sliced={sliced} apiGet={apiGet} handleClickOnGrid={handleClickOnGrid} element={element} setSelected={setSelected} selected={selected||[]}  checkIfChecked={checkIfChecked} ></RowWhiteList>;
                                }else if(nameParameterApi === 'idOrchestratore'){
                                    return <RowOrchestratore key={Math.random()}  element={element} sliced={sliced} headerNames={headerNames}></RowOrchestratore>;
                                }else if(nameParameterApi === 'asyncDocEnte'){
                                    return <RowAsyncDoc key={Math.random()} sliced={sliced} headerNames={headerNames} handleClickOnGrid={handleClickOnGrid} element={element}></RowAsyncDoc>;
                                }else if(nameParameterApi === "contestazionePage"){
                                    return <RowContestazioni key={Math.random()} sliced={sliced}apiGet={apiGet} handleClickOnGrid={handleClickOnGrid} element={element} headerNames={headerNames}></RowContestazioni>;
                                }else if(nameParameterApi === "modComTrimestrale"){
                                    return  <DefaultRow key={element.id} handleClickOnGrid={handleClickOnGrid} element={element} sliced={sliced} apiGet={()=> console.log("go to details")} headerNames={headerNames}></DefaultRow>;
                                }else if(nameParameterApi === "idPrevisonale"){
                                    return <RowModCommessaPrevisionale key={element.id} sliced={sliced} element={element} headerNames={headerNames}></RowModCommessaPrevisionale>;
                                }else if(nameParameterApi === "docEmessiEnte"){
                                    return <RowCollapsible key={element.id} sliced={sliced} element={element} headerNames={headerNames} headerNamesCollapse={headerNamesCollapse} apiGet={apiGet}></RowCollapsible>;
                                }else{
                                     
                                    return (
                                        <TableRow sx={{
                                            height: '80px',
                                            borderTop: '4px solid #F2F2F2',
                                            borderBottom: '2px solid #F2F2F2',
                                            '&:hover': {
                                                backgroundColor: '#EDEFF1',
                                            },
                                        }}  key={Math.random()}>
                                            {
                                                Object.values(sliced).map((value:string|number|any, i:number)=>{
                                                    const cssFirstColum = i === 0 ? {color:'#0D6EFD', fontWeight: 'bold', cursor: 'pointer'} : null;
                                                    const valueEl = (i === 0 && value?.toString().length > 30) ? value?.toString().slice(0, 30) + '...' : value;
                                                    return (
                                                        <Tooltip key={Math.random()} 
                                                            title={
                                                                (value === "--" 
                                                                || nameParameterApi === "idNotifica"
                                                                || valueEl?.length < 30
                                                                ||((nameParameterApi=== "idTestata"&& i === 0 && valueEl?.length < 30) 
                                                                ||nameParameterApi=== "idTestata"&& i !== 0 ))
                                                                    ?null
                                                                    :value}>
                                                            <TableCell
                                                                align={(nameParameterApi === "modComTrimestrale"|| nameParameterApi === "docEmessiEnteContestate" ||i !== 0)?"center":"left"}
                                                                sx={cssFirstColum} 
                                                                onClick={()=>{if(i === 0){handleClickOnGrid(element);}}}>
                                                                {(valueEl === null||valueEl === "") ? "--":valueEl}
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
                    </Table>      
                </Card>
            </div>
            {paginationVisibile !== false &&
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
            }
        </div>
        
    );
};

export default GridCustom;
