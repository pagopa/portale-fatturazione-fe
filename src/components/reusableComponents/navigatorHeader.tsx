import { Typography } from "@mui/material";
import { ButtonNaked } from "@pagopa/mui-italia";
import { PathPf } from "../../types/enum";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from "react-router";
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';


interface NavigationHeaderProps {
    pageFrom:string,
    pageIn:string,
    backPath:PathPf,
    icon:any

}

const NavigatorHeader:React.FC<NavigationHeaderProps> = ({pageFrom,pageIn, backPath,icon}) => {

    const navigate = useNavigate();

    return (
        <div className='marginTop24'>
            <div className='ms-5'>
                <ButtonNaked
                    color="primary"
                    onFocusVisible={() => { console.log('onFocus'); }}
                    size="small"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(backPath)}
                >
            Indietro
                </ButtonNaked>
                <Typography sx={{marginLeft:'20px'}} variant="caption">
                    {icon}
                    {pageFrom}
                </Typography>
                <Typography sx={{fontWeight:'bold', marginLeft:'5px'}} variant="caption">
                    {pageIn}
                </Typography>
            </div>
        </div>
    );
};

export default NavigatorHeader;