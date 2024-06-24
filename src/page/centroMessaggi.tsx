import { Button, Typography } from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';



const CentroMessaggi : React.FC = () => {

  

    return (
        <div className="mx-5">
            <div className="marginTop24 ">
                <Typography variant="h4">Centro Messaggi</Typography>
            </div>
            <div className="marginTop24" style={{display:'flex', justifyContent:'space-between', height:"48px"}}>
               
               
                
                
                {
                    [].length > 0 &&
                <Button onClick={() => console.log('grid')}
                    disabled={false}
                >
                Download Risultati
                    <DownloadIcon sx={{marginRight:'10px'}}></DownloadIcon>
                </Button>
                }
            </div>
            <div className="mt-1 mb-5" style={{ width: '100%'}}>
               
            </div>
            <div>
             
            </div>
            
        </div>
    );

};

export default CentroMessaggi;