import { Skeleton } from "@mui/material";



const SuspenseDatiFatturazione:React.FC = () =>{

    return(
        <div  className="mx-5 marginTop24">
           
            <Skeleton variant="text" sx={{ fontSize: '1rem', width:'50%' }} /> 
            
            <Skeleton variant="text" sx={{ fontSize: '1rem',width:'70%',height:'80px' }} /> 
            <div className="d-flex justify-content-end">
                <Skeleton variant="rectangular" sx={{width:'100px',height:'48px' }} />
            </div>
          
           
            <div className='mt-3'>
                <Skeleton variant="rectangular" width={'100%'} height={510}  />
            </div>
            <div>
            
                <div className="d-flex justify-content-between mt-5 mb-5 ">
                    <Skeleton variant="rectangular"  sx={{width:'100px',height:'48px' }}/>
            
      
                    <Skeleton variant="rectangular" width={'100px'} height={'48px'}/>
                </div>
           
            </div>
    
        </div>
    );
};

export default SuspenseDatiFatturazione;