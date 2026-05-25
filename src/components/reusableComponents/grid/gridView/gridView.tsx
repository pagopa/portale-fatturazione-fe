import { Box, IconButton, Skeleton, styled, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import NoDataRow from "../noDataRow";

const StyledBox = styled(Box)({
  margin: "16px",
  backgroundColor:'#F8F8F8',
  padding:'10px'
});
type GridViewProps = {
  arrayData: any[],
  configHeader: {label:string,keyObj?:string}[],
  title?: string,
  noDataMessage: string,
  noDataTitle: string,
  apiRunning: boolean
}
const GridView : React.FC<GridViewProps> = ({arrayData,configHeader,title,noDataMessage,noDataTitle,apiRunning}) => {

  return (
    <StyledBox>
      <div className="bg-white my-5 ">         
        <div className="row text-center">  
          <div  className="col-12">
            {title && 
            <StyledBox sx={{ margin: 2, backgroundColor: "#F8F8F8", padding: "10px" }}>
              {apiRunning ? (
                <Skeleton 
                  variant="text" 
                  sx={{ fontSize: "2rem", width: "40%", margin: "0 auto" }} 
                />
              ) : (
                <Typography variant="h4">{title}</Typography>
              )}
            </StyledBox>
            }
            <StyledBox>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow sx={{borderColor:"white",borderWidth:"thick"}}>   
                    {configHeader.map((header:any)=>{
                      return (
                        <TableCell align="center" sx={{ width:"auto"}} key={Math.random()}>{header.label}</TableCell>
                      );
                    })}
                  </TableRow>
                </TableHead>
                <TableBody sx={{borderColor:"white",borderWidth:"thick"}}>
                  {Object.values(arrayData).length === 0 ? (
                    <NoDataRow colSpan={configHeader.length} noDataTitle={noDataTitle} noDataMessage={noDataMessage} />
                  ) : (
                    Object.values(arrayData).map((tabCel: any, index: number) => (
                      <TableRow key={index}>
                        {configHeader.map((header: any) =>{
                          if(header.keyObj === "icon"){
                            return (
                              <TableCell align="center" sx={{ width: "auto" }} key={header.keyObj}>
                                <Tooltip title={"Download file"}>
                                  <IconButton disabled={false}  component="label">
                                    <FileDownloadIcon sx={{ fontSize: 30 }} />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            );
                          }else{
                            return(
                              <TableCell align="center" sx={{ width: "auto" }} key={header.keyObj}>
                                {tabCel[header.keyObj]}
                              </TableCell>
                            );
                          }
                        } )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </StyledBox>
          </div>
        </div>
      </div> 
    </StyledBox>
    
  );

 
};  

export default GridView;