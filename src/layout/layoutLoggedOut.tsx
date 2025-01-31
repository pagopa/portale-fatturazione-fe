import { Grid } from "@mui/material";
import FooterComponent from "./footer";
import HeaderLogAzure from "./mainHeader/headerLogInOutAzure";


const LayoutLoggedOut = ({page}) => {
    return (
        <>
            <HeaderLogAzure/>
            <Grid sx={{ height: '100%' }}>
                {page}
            </Grid>
            <FooterComponent  />
        </>
    );
};
export default LayoutLoggedOut;
