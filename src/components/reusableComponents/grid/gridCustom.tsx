import { Card, Table, TableBody, TableCellProps, TablePagination } from "@mui/material";
import React, { SetStateAction } from "react";
import HeaderGridCustom from "./headerGrid/headerGridCustom";
import EmptyRow from "./emptyRow";

import GridRowDesignByConfigFile from "./rowComponent/gridRowDesignByConfigFile";
interface GridCustomProps<T> {
    elements:  T[],
    changePage:(event: React.MouseEvent<HTMLButtonElement> | null,newPage: number) => void,
    changeRow:( event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void,
    page:number,
    total:number,
    rows:number,
    headerNames:HeaderGridCustom[],
    headerNamesCollapse?:HeaderGridCustom[],
    nameParameterApi:string 
    apiGet?:(el: T)=> void 
    disabled:boolean
    widthCustomSize:string
    setAction?:(obj:T,action:string) => void
    buttons?:{
        stringIcon:string
        icon:React.ReactNode
        action:string
    }[],
    headerAction?:(val:number) =>void,
    body?: T,
    paginationVisibile?:boolean,
    objectSort?:{[key:string]:number},
    sentenseEmpty?:string,
    headerActionSort?:(val:string, setGridData:React.Dispatch<SetStateAction<Record<string, unknown>[]>>,val2:boolean,setObjet:React.Dispatch<SetStateAction<{[key:string]:number}>>,p:number,r:number,listaResponse: Record<string, unknown>[]) =>void,
    setGridData?:React.Dispatch<SetStateAction<T[]>>
    gridType?:boolean,
    setObjectSort?:React.Dispatch<SetStateAction<{[key:string]:number}>>,
    listaResponse?: Record<string, unknown>[],
    headerActionSortServerSide?:(label:string) => void,
    titleRowCollapse?:string,
    keyCollapse?:string,
    bgColorRowFunction?:(element:T) => string
}

export interface HeaderGridCustom {
    label:string,
    align:TableCellProps['align'],
    width:string|undefined,
    headerAction?:boolean,
    headerTooltip?: (title: string, label: string, color: string) => JSX.Element,
    headerChip?: (title: string, label: string, color: string) => JSX.Element,
    gridAction?:(fun:(obj:T,action:string) => void,color:string,disabled:boolean,obj:any) => JSX.Element,
    gridOpenDetail?:(disabled:boolean,open?:boolean,setOpen?:(val)=>void) => JSX.Element,
    headerActionSort?:boolean,
    keyValue:string,
    typeColumn?:string,
    hideColumn?:boolean,
    switchValue?:{keySwitch:number, valueSwitch:string}[],
    chip?:boolean,
    funToManipulateValue?: (val: any, fun?: any) => any;
    makeAction?:boolean,
    applyCss?:boolean,
    keyToManipulateData?:string,
    variant?: "caption-semibold" | "caption" | "body1" | "body2" | "subtitle1" | "subtitle2" | "h6" | "h5" | "h4" | "h3" | "h2" | "h1"; 
}


const GridCustom = <T,>({
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
  setAction,
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
  headerActionSortServerSide,
  titleRowCollapse,
  keyCollapse,
  bgColorRowFunction
}: GridCustomProps<T>) => {
 
  return (
    <div>
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
                return (
                  <GridRowDesignByConfigFile
                    key={`${index}-${Object.values(element||{})[0]}`}
                    element={element}
                    apiGet={apiGet}
                    headerNames={headerNames}
                    headerNamesCollapse={headerNamesCollapse}
                    setAction={setAction}
                    titleRowCollapse={titleRowCollapse}
                    keyCollapse={keyCollapse}
                    bgColorRowFunction={bgColorRowFunction}
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
