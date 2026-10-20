import { Box, Grid } from "@mui/material";
import FooterComponent from "./footer";
import { Outlet, useLocation } from "react-router";
import BasicAlerts from "../components/reusableComponents/modals/alert";

// pagine di solo contenuto: niente header/footer
const CONTENT_ONLY_PATHS = ["/azure", "/auth", "/auth/azure"];

const LayoutLoggedOut = () => {
  const { pathname } = useLocation();
  const contentOnly = CONTENT_ONLY_PATHS.includes(pathname.replace(/\/+$/, ""));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <BasicAlerts></BasicAlerts>
      <Grid sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <Outlet />
      </Grid>
      {!contentOnly && <FooterComponent></FooterComponent>}
    </Box>
  );
};
export default LayoutLoggedOut;
