import { Card, Table, TableBody, TableCellProps, TablePagination } from "@mui/material";
import React, { SetStateAction } from "react";
import HeaderGridCustom from "./headerGrid/headerGridCustom";
import EmptyRow from "./emptyRow";
import GridRowsRenderer from "./rowComponent/gridRowsRenderer";
import GridRowDesignByConfigFile from "./rowComponent/gridRowDesignByConfigFile";
interface GridCustomProps<T = any> {
    elements:  T[],
    changePage:(event: React.MouseEvent<HTMLButtonElement> | null,newPage: number) => void,
    changeRow:( event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void,
    page:number,
    total:number,
    rows:number,
    headerNames:HeaderGridCustom[],
    headerNamesCollapse?:HeaderGridCustom[],
    nameParameterApi:string 
    apiGet?:(el: any)=> void 
    disabled:boolean
    widthCustomSize:string
    setAction?:(obj:any,action:string) => void
    selected?:number[]
    setSelected?:React.Dispatch<SetStateAction<number[]>>
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
    setGridData?:React.Dispatch<SetStateAction<any>[]>
    gridType?:boolean,
    setObjectSort?:React.Dispatch<SetStateAction<{[key:string]:number}>>,
    listaResponse?: Record<string, unknown>[],
    headerActionSortServerSide?:(label:string) => void,
    titleRowCollapse?:string,
    keyCollapse?:string,
     bgColorRowFunction?:(element:any) => string
}

export interface HeaderGridCustom {
    label:string,
    align:TableCellProps['align'],
    width:string|undefined,
    headerAction?:boolean,
    headerTooltip?: (title: string, label: string, color: string) => JSX.Element,
    headerChip?: (title: string, label: string, color: string) => JSX.Element,
    gridAction?:(fun:(obj:any,action:string) => void,color:string,disabled:boolean,obj:any) => JSX.Element,
    gridOpenDetail?:(disabled:boolean,open?:boolean,setOpen?:(val)=>void) => JSX.Element,
    headerActionSort?:boolean,
    keyValue:string,
    renderValue?:(el,fun:(el,string) => any) => JSX.Element,

    
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
  setAction,
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
  headerActionSortServerSide,
  titleRowCollapse,
  keyCollapse,
  bgColorRowFunction
}) =>{

  const checkIfChecked = (id: number) => {
    return Boolean(selected?.includes(id));
  };
    
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
                }else if (nameParameterApi === 'docEmessiSend') {
                  sliced = Object.fromEntries(Object.entries(element).slice(4,-1));
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

              {elements.length > 0 && elements.map((element,index) => {
                return (
                  <GridRowDesignByConfigFile
                    key={index + nameParameterApi}
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
