import { Card, Table, TableBody, TableCellProps, TablePagination } from "@mui/material";
import { GridElementListaPsp } from "../../../types/typeAngraficaPsp";
import { Rel } from "../../../types/typeRel";
import { NotificheList } from "../../../types/typeReportDettaglio";
import { ContestazioneRowGrid } from "../../../page/prod_pn/storicoContestazioni";
import { DataGridAsyncDoc } from "../../../page/ente/asyncDocumenti";
import { DataGridOrchestratore } from "../../../page/prod_pn/processiOrchestratore";
import { Whitelist } from "../../../page/prod_pn/whiteList";
import HeaderGridCustom from "./headerGrid/headerGridCustom";
import EmptyRow from "./emptyRow";
import GridRowsRenderer from "./rowComponent/gridRowsRenderer";
import EnhancedTableCustom from "./gridCustomBase/enhancedTabalToolbarCustom";
import React, { SetStateAction } from "react";

interface GridCustomProps<T = any> {
    elements:  T[],
    changePage:(event: React.MouseEvent<HTMLButtonElement> | null,newPage: number) => void,
    changeRow:( event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void,
    page:number,
    total:number,
    rows:number,
    headerNames:HeaderGridCustom[],
    headerNamesCollapse?:string[]|{label:string,align: TableCellProps['align'],width:number|string}[],
    nameParameterApi:string 
    apiGet?:(el: any)=>void 
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
    body?: any,
    paginationVisibile?:boolean,
    objectSort?:{[key:string]:number},
    sentenseEmpty?:string,
    headerActionSort?:(val:string, setGridData:React.Dispatch<SetStateAction<Record<string, unknown>[]>>,val2:boolean,setObjet:React.Dispatch<SetStateAction<{[key:string]:number}>>,p:number,r:number,listaResponse: Record<string, unknown>[]) =>void,
    setGridData?:React.Dispatch<SetStateAction<any>[]>
    gridType?:boolean,
    setObjectSort?:React.Dispatch<SetStateAction<{[key:string]:number}>>,
    listaResponse?: Record<string, unknown>[],
    headerActionSortServerSide?:(label:string) => void
}

export interface HeaderGridCustom {
    label:string,
    align:TableCellProps['align'],
    width:number|string,
    headerAction?:boolean,
    headerTooltip?: (title: string, label: string, color: string) => JSX.Element,
    headerChip?: (title: string, label: string, color: string) => JSX.Element,
    gridAction?:(fun:(id) => void,color:string,disabled:boolean,obj:any) => JSX.Element,
    gridOpenDetail?:(disabled:boolean,open?:boolean,setOpen?:(val)=>void) => JSX.Element,
    headerActionSort?:boolean
}


const GridCustom: React.FC<GridCustomProps> = ({
  elements,
  changePage,
  changeRow,
  page,
  total,
  rows,
  headerNames,
  nameParameterApi,
  apiGet,
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
  gridType=false,
  headerActionSort,
  setObjectSort,
  listaResponse=[],
  headerActionSortServerSide
}) =>{

  const checkIfChecked = (id: number) => {
    return Boolean(selected?.includes(id));
  };
    
  return (
    <div>
      {nameParameterApi === "idWhite" && <EnhancedTableCustom  setOpenModal={setOpenModalDelete} setOpenModalAdd={setOpenModalAdd} selected={selected||[]} buttons={buttons} ></EnhancedTableCustom>}
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <Card sx={{ width: widthCustomSize, minWidth: '100%', backgroundColor: 'transparent' }}>
          <Table sx={{ backgroundColor: 'white' }}>
            <HeaderGridCustom
              headerNames={headerNames}
              nameParameterApi={nameParameterApi}
              headerAction={headerAction}
              objectSort={objectSort}
              total={total}
              elements={elements}
              body={body}
              headerActionSort={headerActionSort}
              setGridData={setGridData}
              setObjectSort={setObjectSort}
              gridType={gridType}
              page={page}
              rows={rows}
              listaResponse={listaResponse}
              headerActionSortServerSide={headerActionSortServerSide}
            />
            <TableBody sx={{ marginLeft: '20px', height: '50px' }}>
              {(elements.length === 0 && sentenseEmpty) &&
                <EmptyRow sentenseEmpty={sentenseEmpty} />
              }
              {elements.length > 0 && elements.map((element,index) => {
                let sliced = Object.fromEntries(Object.entries(element).slice(1));

                if (nameParameterApi === 'idWhite') {
                  sliced = Object.fromEntries(Object.entries(element).slice(1, -1));
                } else if (nameParameterApi === 'contestazionePage') {
                  sliced = Object.fromEntries(Object.entries(element).slice(1, -1));
                } else if (nameParameterApi === 'modComTrimestrale') {
                  sliced = Object.fromEntries(Object.entries(element).slice(1, -4));
                } else if (nameParameterApi === 'idPrevisonale') {
                  sliced = Object.fromEntries(Object.entries(element).slice(5));
                } else if (nameParameterApi === 'docEmessiEnte') {
                  sliced = Object.fromEntries(Object.entries(element).slice(3, -1));
                } else if (nameParameterApi === 'docEmessiEnteContestate') {
                  sliced = Object.fromEntries(Object.entries(element).slice(4, -2));
                } else if (nameParameterApi === 'docSospesiSend') {
                  sliced = Object.fromEntries(Object.entries(element).slice(2, -3));
                }

                const elementKey = (element as Record<string, unknown>).id ?? Math.random();

                return (
                  <GridRowsRenderer
                    key={String(`${elementKey||"row"}-${index}`)}
                    element={element}
                    sliced={sliced}
                    nameParameterApi={nameParameterApi}
                    apiGet={apiGet}
                    headerNames={headerNames}
                    headerNamesCollapse={headerNamesCollapse}
                    selected={selected}
                    setSelected={setSelected}
                    checkIfChecked={checkIfChecked}
                  />
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>
      {paginationVisibile !== false &&
        <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', paddingTop: '0.75rem' }}>
          <TablePagination
            sx={{
              '.MuiTablePagination-toolbar': {
                justifyContent: 'flex-end',
                width: '100%'
              },
              '.MuiTablePagination-selectLabel': {
                display: 'none',
                backgroundColor: '#f2f2f2'
              }
            }}
            component="div"
            page={total > 0 ? page : 0}
            count={total}
            rowsPerPage={rows}
            onPageChange={changePage}
            onRowsPerPageChange={changeRow}
          />
        </div>
      }
      
    </div>
  );
};

export default GridCustom;
