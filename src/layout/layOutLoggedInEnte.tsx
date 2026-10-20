import { Box, Grid } from "@mui/material";
import { Outlet } from "react-router-dom";
import HeaderProductEnte from "./headerProduct/headerProductEnte";
import HeaderLogEnte from "./mainHeader/headerLogInOutEnte";
import ScrollToTop from "../components/reusableComponents/scrollToTop";
const LayoutEnte = ({sideNav}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: '1 0 auto' }}>
      <HeaderLogEnte/>
      <HeaderProductEnte/>
      <ScrollToTop/>
      <Grid sx={{ flex: 1, flexWrap: 'nowrap', marginTop: 0, '& > .MuiGrid-item': { paddingTop: 0 } }} container spacing={2} columns={12}>
        <Grid item xs={2} sx={{ display: 'flex', flexDirection: 'column', '& > *': { flexGrow: 1 } }}>
          {sideNav}
        </Grid>
        <Grid item xs={10} sx={{ display: 'flex', flexDirection: 'column', '& > *': { flexGrow: 1 } }}>
          <Outlet />
        </Grid>
      </Grid>
    </Box>
  );
};

export default LayoutEnte;
