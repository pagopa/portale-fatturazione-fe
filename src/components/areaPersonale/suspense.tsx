import { Skeleton } from "@mui/material";


const SuspenseDatiFatturazione = () =>{

    return(
        <div >
            <Skeleton variant="text" sx={{ fontSize: '1rem' }} /> 
           
            <div className='mt-5'>
                <Skeleton variant="rectangular" width={210} height={60}  />
            </div>
            <div>
            
                <div className="d-flex justify-content-between m-5 ">
                    <Skeleton variant="rectangular" width={160} height={60}/>
            
      
                    <Skeleton variant="rectangular" width={160} height={60}/>
                </div>
           
            </div>
    
        </div>
    );
};

export default SuspenseDatiFatturazione;