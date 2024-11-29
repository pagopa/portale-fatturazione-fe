import { Grid } from "@mui/material";
import HeaderPostLogin from "./headerPostLogin";
import FooterComponent from "./footer";


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
