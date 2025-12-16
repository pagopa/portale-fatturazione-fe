import { Grid } from "@mui/material";
import FooterComponent from "./footer";

import { Outlet, useLocation, useNavigation } from "react-router";
import BasicAlerts from "../components/reusableComponents/modals/alert";
import Loader from "../components/reusableComponents/loader";



const LayoutLoggedOut = () => {
    const navigation = useNavigation();

    console.log({PP:navigation.state}); 
    return (
        <>
            <BasicAlerts></BasicAlerts>
            <Grid sx={{ height: '100%' }}>
                
                <Outlet />
            </Grid>
            <FooterComponent></FooterComponent>
        </>
    );
};
export default LayoutLoggedOut;
