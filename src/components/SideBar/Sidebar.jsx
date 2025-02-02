import React from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";

import SidebarContent from "./SidebarContent";

const Sidebar = ({ mobileOpen, handleDrawerToggle, drawerWidth, menubarHeight }) => {
  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
          },
        }}
      >
        <SidebarContent />
      </Drawer>

      {/* Permanent drawer (desktop) */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            height: `calc(100% - ${menubarHeight}px)`,
            boxSizing: "border-box",
          },
        }}
        open
      >
        <SidebarContent />
      </Drawer>
    </Box>
  );
};

Sidebar.propTypes = {
  mobileOpen: PropTypes.bool.isRequired,
  handleDrawerToggle: PropTypes.func.isRequired,
  drawerWidth: PropTypes.string.isRequired,
  menubarHeight: PropTypes.string.isRequired,
};

export default Sidebar;
