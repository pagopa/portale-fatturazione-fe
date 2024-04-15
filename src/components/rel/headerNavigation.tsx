import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ButtonNaked} from '@pagopa/mui-italia';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';

import { Typography } from "@mui/material";
import { useNavigate } from 'react-router';
import { PathPf } from '../../types/enum';

const HeaderNavigationRel : React.FC = () =>{

    const navigate = useNavigate();

    return(
        <div className='d-flex marginTop24 ms-5 '>
            <ButtonNaked
                color="primary"
                onFocusVisible={() => { console.log('onFocus'); }}
                size="small"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(PathPf.LISTA_REL)}
           
            >
            Indietro

            </ButtonNaked>
      
            <Typography sx={{ fontWeight:'bold', marginLeft:'20px'}} variant="caption">
                <ManageAccountsIcon sx={{paddingBottom:'3px'}}  fontSize='small'></ManageAccountsIcon>
              Rel 
            
            </Typography>
        
        </div>
    );
};
export default HeaderNavigationRel;