import { Skeleton } from "@mui/material";



const SkeletonRelPdf:React.FC = () =>{
    return(
        <div  className="marginTop24 ms-5">
            <Skeleton variant="text" sx={{ fontSize: '1rem', width:'40%' }} /> 
            <div className='mt-3'>
                <Skeleton variant="rectangular" width={'100%'} height={'840px'}  />
            </div>
            <div className="d-flex justify-content-left mt-5 mb-5 ">
                <Skeleton variant="rectangular"  sx={{width:'200px',height:'48px' }}/>
            </div>
        </div>
    );
};

export default SkeletonRelPdf;