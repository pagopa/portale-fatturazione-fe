import { Box, Grid } from "@mui/material";
import FooterComponent from "./footer";
import { Outlet } from "react-router";
import BasicAlerts from "../components/reusableComponents/modals/alert";

const LayoutLoggedOut = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <BasicAlerts></BasicAlerts>
      <Grid sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

        <Outlet />
      </Grid>
      <FooterComponent></FooterComponent>
    </Box>
  );
};
export default LayoutLoggedOut;
