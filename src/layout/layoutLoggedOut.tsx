import { Grid } from "@mui/material";
import FooterComponent from "./footer";

import { Outlet } from "react-router";
import BasicAlerts from "../components/reusableComponents/modals/alert";

const LayoutLoggedOut = () => {
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
