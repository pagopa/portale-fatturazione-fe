import { Grid } from "@mui/material";
import FooterComponent from "./footer";
import HeaderPostLogin from "./headerLoginLogout";


const LayoutLoggedOut = ({page}) => {
    return (
        <>
            <HeaderPostLogin/>
            <Grid sx={{ height: '100%' }}>
                {page}
            </Grid>
            <FooterComponent  />
        </>
      
    );
};

export default LayoutLoggedOut;
