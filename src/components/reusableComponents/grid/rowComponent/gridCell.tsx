import { useState } from "react";
import {
  TableCell,
  Tooltip,
  Chip,
  Box,
  Switch,
  Typography,
  IconButton,
  Snackbar,
  Alert,
  SxProps,
  Theme,
} from "@mui/material";
import ArticleIcon from "@mui/icons-material/Article";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import dayjs from "dayjs";
import { HeaderGridCustom } from "../gridCustom";
import { mesiGrid } from "../../../../reusableFunction/reusableArrayObj";

type CopyCellProps = {
  value: string;
  align?: "left" | "center" | "right" | "inherit" | "justify";
};

type GridCellProps = {
  rowObject: HeaderGridCustom;
  index: number;
  element: Record<string, any>;
  headerNames: HeaderGridCustom[];
  apiGet?: (element: Record<string, any>) => void;
  cssFirstColum?: any;
  cssFirstColumRagioneSociale?: any;
  flexCenterStyle?: any;
  isRowOpen?: boolean; // stato di espansione, per il case "collaps"
  onToggleRow?: () => void; // handler per il case "collaps"
};

const flexCenterStyle: SxProps<Theme> = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: 1,
};

const cssFirstColumRagioneSociale : SxProps<Theme> = {
  color:'#0D6EFD',
  fontWeight: 'bold',
  cursor: 'pointer',
  width:"350px"
};

const cssFirstColum : SxProps<Theme> = {
  color:'#0D6EFD',
  fontWeight: 'bold',
  cursor: 'pointer',
};

const GridCell = ({
  rowObject,
  index: i,
  element,
  headerNames,
  apiGet,
  isRowOpen,
  onToggleRow,
}: GridCellProps) => {
  const value = element[rowObject.keyValue];

  switch (rowObject.typeColumn) {
  case "string": {
    const isLong = value?.toString().length > 20;
    return (
      <Tooltip key={`${i}-${value}`} title={isLong ? value : null}>
        <TableCell
          onClick={() => {
            if (apiGet && headerNames[i]?.makeAction) apiGet(element);
          }}
          align="center"
          sx={headerNames[i]?.makeAction ? cssFirstColum : null}
        >
          {value
            ? isLong
              ? value.toString().slice(0, 10) + "..."
              : value
            : "--"}
        </TableCell>
      </Tooltip>
    );
  }

  case "number":
    return (
      <TableCell align="center">{value === null ? "--" : value}</TableCell>
    );

  case "boolean":
    return (
      <TableCell align="center">
        {value === null ? "--" : value === true ? "Si" : "No"}
      </TableCell>
    );

  case "mese-number":
    return <TableCell align="center">{mesiGrid[value] || "--"}</TableCell>;

  case "ragionesociale": {
    const isLong = value?.toString().length > 40;
    return (
      <Tooltip key={`${i}-${value}`} title={isLong ? value : null}>
        <TableCell
          onClick={() => {
            if (apiGet && headerNames[i]?.makeAction) apiGet(element);
          }}
          align={i === 0 ? "left" : "center"}
          sx={headerNames[i]?.applyCss ? cssFirstColumRagioneSociale : null}
        >
          {isLong ? value?.toString().slice(0, 37) + "..." : value}
        </TableCell>
      </Tooltip>
    );
  }

  case "data": {
    let valueData = dayjs(value).format("YYYY-MM-DD");
    if (rowObject.keyValue === "dataChiusura") {
      valueData =
          element.source === "archiviato"
            ? "--"
            : element.source === "facoltativo"
              ? "TBD"
              : dayjs(element.dataChiusura).format("YYYY-MM-DD");
    }
    return (
      <TableCell key={`${i}-${value}`} align="center">
        {valueData || "--"}
      </TableCell>
    );
  }

  case "number-tipocontratto":
    return (
      <TableCell key={`${i}-${value}`} align="center">
        {value === null ? "--" : Number(value) === 1 ? "PAL" : "PAC"}
      </TableCell>
    );

  case "data-ora": {
    const valueData = value ? value.replace("T", " ").substring(0, 19) : "";
    return (
      <TableCell key={`${i}-${value}`} align="center">
        {valueData || "--"}
      </TableCell>
    );
  }

  case "euro-centesimi":
    return (
      <TableCell key={`${i}-${value}`} align="center">
        {value != null
          ? (Number(value) / 100).toLocaleString("de-DE", {
            style: "currency",
            currency: "EUR",
          })
          : "--"}
      </TableCell>
    );

  case "euro":
    return (
      <TableCell key={`${i}-${value}`} align="center">
        {value != null
          ? Number(value).toLocaleString("de-DE", {
            style: "currency",
            currency: "EUR",
          })
          : "--"}
      </TableCell>
    );

  case "euro-number":
    return (
      <TableCell key={`${i}-${value}`} align="center">
        {value != null
          ? value.toLocaleString("de-DE", {
            style: "currency",
            currency: "EUR",
          })
          : "--"}
      </TableCell>
    );

  case "switch":
    return (
      <TableCell key={`${i}-${value}`} align="center">
        <Box sx={flexCenterStyle}>
          <Typography>
            {rowObject.switchValue && rowObject.switchValue[0].valueSwitch}
          </Typography>
          <Switch
            onChange={() => {
              if (apiGet) apiGet(element);
            }}
            checked={element.tipoContratto === 1}
          />
          <Typography>
            {rowObject.switchValue && rowObject.switchValue[1].valueSwitch}
          </Typography>
        </Box>
      </TableCell>
    );

  case "checkbox":
    // TODO: implementare rendering reale, per ora placeholder
    return (
      <TableCell key={`${i}-checkbox`} align="center">
          checkbox
      </TableCell>
    );

  case "chip": {
    const formattedLabel = value
      ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
      : "--";
    const bgColor =
        rowObject.funToManipulateValue && rowObject.keyToManipulateData
          ? rowObject.funToManipulateValue(element[rowObject.keyToManipulateData])
          : undefined;

    return (
      <TableCell key={`${i}-${value}`} width={rowObject.width} align="center">
        <Chip
          variant="outlined"
          label={formattedLabel}
          sx={{ backgroundColor: bgColor }}
        />
      </TableCell>
    );
  }

  case "snackbar":
    return (
      <CopyToClipboardCell
        key={`${i}-snackbar`}
        value={value}
        align={headerNames[i]?.align}
      />
    );

  case "collaps":
    return (
      <TableCell key={`expand-${element.id}-${i}`} align="center">
        <IconButton
          sx={{ color: "#227AFC" }}
          aria-label="expand row"
          size="small"
          onClick={onToggleRow}
        >
          {isRowOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </IconButton>
      </TableCell>
    );

  case "arrow":
    return (
      <TableCell key={`${i}-arrow`} align="center">
        <IconButton
          size="medium"
          onClick={() => {
            if (apiGet) apiGet(element);
          }}
        >
          <ArrowForwardIcon sx={{ color: "#1976D2", cursor: "pointer" }} />
        </IconButton>
      </TableCell>
    );

  default:
    return null;
  }
};

export default GridCell;





const CopyToClipboardCell = ({ value, align = "center" }: CopyCellProps) => {
  const [open, setOpen] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setOpen(true);
  };

  return (
    <TableCell align={align}>
      <Tooltip title={value}>
        <IconButton onClick={handleCopy}>
          <ArticleIcon sx={{ color: "default" }} fontSize="small" />
        </IconButton>
      </Tooltip>
      <Snackbar
        open={open}
        onClose={() => setOpen(false)}
        autoHideDuration={2000}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setOpen(false)} severity="success">
          Event ID Copiato!
        </Alert>
      </Snackbar>
    </TableCell>
  );
};
