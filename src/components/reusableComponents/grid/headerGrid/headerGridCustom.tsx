import { IconButton, TableCell, TableCellProps, TableHead, TableRow, Tooltip } from "@mui/material";
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { NotificheList } from "../../../../types/typeReportDettaglio";
import { GridElementListaPsp } from "../../../../types/typeAngraficaPsp";
import { ContestazioneRowGrid } from "../../../../page/prod_pn/storicoContestazioni";
import { Rel } from "../../../../types/typeRel";
import { SetStateAction } from "react";

const HeaderGridCustom = ({
  headerNames,
  nameParameterApi,
  headerAction,
  objectSort,
  total,
  elements,
  body,
  headerActionSort,
  setGridData,
  setObjectSort,
  gridType,
  page,
  rows,
  listaResponse,
  headerActionSortServerSide
}:{
    elements:NotificheList[]|Rel[]|GridElementListaPsp[]|ContestazioneRowGrid[]|any
    page:number,
    total:number,
    rows:number,
    headerNames:{label:string,align: TableCellProps['align'],width:number|string,headerAction?:(val:number) =>void,headerActionSort?:boolean}[],
    nameParameterApi:string 
    headerAction?:(val:number) =>void,
    body?:any,
    objectSort?:{[key:string]:number},
    headerActionSort?:(val:string, setGridData:React.Dispatch<SetStateAction<any[]>>,val2:boolean,setObjet:React.Dispatch<SetStateAction<{[key:string]:number}>>,p:number,r:number,listaResponse:any[]) =>void,
    setGridData?:React.Dispatch<SetStateAction<any[]>>
    gridType?:boolean,
    setObjectSort?:React.Dispatch<SetStateAction<{[key:string]:number}>>,
    listaResponse?:any[],
    headerActionSortServerSide?:(label:string) => void
}) => {
  return (
    <TableHead sx={{backgroundColor:'#f2f2f2'}}>
      <TableRow>
        {headerNames.map((el, i) => {
          const sortValue = objectSort?.[el.label] ?? 0;

          switch(nameParameterApi) {

          case 'idOrchestratore':
          case 'asyncDocEnte':
          case 'idPrevisonale':
            return (
              <TableCell key={`tableCell-${i}`} align={el.align} width={el.width}>{el.label}
                {el.headerAction &&
                <Tooltip title="Sort">
                  <span>
                    <IconButton
                      disabled={total === 0}
                      sx={{marginLeft:'10px'}}
                      onClick={() => headerAction && headerAction((body?.ordinamento === 0) ? 1 : 0)}
                      size="small"
                    >
                      {(body?.ordinamento === 0) ? <ArrowUpwardIcon/> : <ArrowDownwardIcon/>}
                    </IconButton>
                  </span>
                </Tooltip>}
              </TableCell>
            );

          case 'contestazionePage':
          case 'modComTrimestrale':
            return (
              <TableCell key={`tableCell-${i}`} align={el.align} width={el.width}>{el.label}</TableCell>
            );

          case 'docEmessiEnte':
          case 'docEmessiEnteContestate':
          case 'docSospesiSend':
            return (
              <TableCell key={`tableCell-${i}`} align={el.align} width={el.width}>{el.label}
                {(el.headerActionSort && objectSort && objectSort[el.label]) &&
                <Tooltip title="Sort">
                  <span>
                    <IconButton
                      disabled={total === 0 || elements.length === 0}
                      sx={{marginLeft:'10px'}}
                      onClick={() => (headerActionSort && setGridData && setObjectSort && listaResponse) &&
                        headerActionSort(el.label, setGridData, gridType, setObjectSort, page, rows, listaResponse)}
                      size="small"
                    >
                      {(sortValue === 1) ? <ArrowUpwardIcon sx={{ color: 'text.disabled'}}/> :
                        (sortValue === 2) ? <ArrowUpwardIcon/> :
                          <ArrowDownwardIcon/>}
                    </IconButton>
                  </span>
                </Tooltip>}
              </TableCell>
            );

          case 'idNotifica':
            return (
              <TableCell key={`tableCell-${i}`} align={el.align} width={el.width}>{el.label}
                {(el.headerActionSort && headerActionSortServerSide && body?.sort) &&
                <Tooltip title="Sort">
                  <span>
                    <IconButton
                      disabled={total === 0 || elements.length === 0}
                      sx={{marginLeft:'10px'}}
                      onClick={() => headerActionSortServerSide && headerActionSortServerSide(el.label)}
                      size="small"
                    >
                      {(body?.sort.order === null) ? <ArrowUpwardIcon sx={{ color: 'text.disabled'}}/> :
                        (body?.sort.order === "2") ? <ArrowUpwardIcon/> :
                          <ArrowDownwardIcon/>}
                    </IconButton>
                  </span>
                </Tooltip>}
              </TableCell>
            );

          default:
            return (
              <TableCell key={`tableCell-${i}`} align="center">{el.label}</TableCell>
            );
          }
        })}
      </TableRow>
    </TableHead>
  );
};

export default HeaderGridCustom;