/**
 * Common MUI styles for session list items
 */
export const commonButtonStyles = (theme, isActive = false) => ({
    mr: 1,
    ml: 1,
    borderRadius: 3,
    backgroundColor: isActive
      ? theme.palette.action.selected
      : "transparent",
    "&.Mui-selected": {
      backgroundColor: theme.palette.action.selected,
    },
    "&:hover": {
      backgroundColor: theme.palette.action.selected,
    },
    color: "text.primary",
    "& .MuiListItemText-root": { color: "text.primary" },
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  });
  