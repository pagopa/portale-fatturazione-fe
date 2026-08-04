import { Box, Collapse, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { HeaderGridCustom } from "../gridCustom";
import { useState } from "react";
import GridCell from "./gridCell";

interface GridRowsRendererProps<T = any>{
  element: any;
  apiGet?: (el: any) => void;
  headerNames:HeaderGridCustom[];
  headerNamesCollapse?: HeaderGridCustom[];
  setOpenModalAction?: (obj:T, action:string) => void;
  titleRowCollapse?:string,
  keyCollapse?:string,
  bgColorRowFunction?: (element:any) => string;
}

const GridRowDesignByConfigFile =  ({
  element,
  apiGet,
  headerNames,
  headerNamesCollapse,
  titleRowCollapse,
  keyCollapse="",
  setOpenModalAction,
  bgColorRowFunction
}: GridRowsRendererProps) => {

  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow sx={{
        height: '80px',
        borderTop: '4px solid #F2F2F2',
        borderBottom: '2px solid #F2F2F2',
        backgroundColor: bgColorRowFunction ? bgColorRowFunction(element) : undefined,
        '&:hover': {
          backgroundColor: '#EDEFF1',
        },
      }}>
        {Object.values(headerNames).map((rowObject: HeaderGridCustom, i: number) => (
          <GridCell
            key={`${rowObject.keyValue}-${i}`}
            rowObject={rowObject}
            index={i}
            element={element}
            headerNames={headerNames}
            apiGet={apiGet}
            isRowOpen={open}          // stato di espansione gestito dal componente padre (riga)
            onToggleRow={() => setOpen(!open)}
            setOpenModalAction={setOpenModalAction}
          />
        ))}
      </TableRow>
      {(headerNamesCollapse && titleRowCollapse) &&
        <TableRow key={`tableRow-position-${element.id}`} >
          <TableCell style={{ paddingBottom: 0, paddingTop: 0}} colSpan={7}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 2 , backgroundColor:'#F8F8F8', padding:'10px'}}>
                <Typography sx={{marginLeft:"6px"}} variant="h6" gutterBottom component="div">
                  {titleRowCollapse}
                </Typography>
                <Table size="small" aria-label="purchases">
                  <TableHead>
                    <TableRow sx={{borderColor:"white",borderWidth:"thick"}}>
                      {
                        Object.values(headerNamesCollapse)?.map((value:any, i:number)=>{
                          return (
                            <TableCell key={`position-${value.label}-${i}`} align='center'>{value.label}</TableCell>
                          );
                        })
                      }
                                                
                    </TableRow>
                  </TableHead>
                  <TableBody sx={{ borderColor: "white", borderWidth: "thick" }}>
                    {element[keyCollapse]?.map((el: any, rowIndex: number) => (
                      <TableRow key={`row-${rowIndex}`}>
                        {Object.values(headerNamesCollapse).map(
                          (rowObjectCollapsed: HeaderGridCustom, colIndex: number) => (
                            <GridCell
                              key={`${rowObjectCollapsed.keyValue}-${colIndex}`}
                              rowObject={rowObjectCollapsed}
                              index={colIndex}
                              element={el}
                              headerNames={headerNamesCollapse}
                              isRowOpen={open}
                              onToggleRow={() => setOpen(!open)}
                            />
                          )
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow> 
      }
    </>
  );
};


export default  GridRowDesignByConfigFile;