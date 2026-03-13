import { Skeleton } from "@mui/material";

const SkeletonRelPdf:React.FC = () =>{
    return(
        <div  className="marginTop24 m-5">
            <Skeleton variant="text" sx={{ fontSize: '1rem', width:'40%' }} /> 
            <div className='mt-5'>
                <Skeleton variant="rectangular" width={'100%'} height={'840px'}  />
            </div>
        </div>
    );
};

export default SkeletonRelPdf;