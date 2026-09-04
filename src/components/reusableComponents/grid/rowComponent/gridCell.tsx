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
  Checkbox,
} from "@mui/material";
import ArticleIcon from "@mui/icons-material/Article";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { HeaderGridCustom } from "../gridCustom";
import { mesiGrid } from "../../../../reusableFunction/reusableArrayObj";
import { transformDateTime019, transformDateTimeWithNameMonth } from "../../../../reusableFunction/function";

type CopyCellProps = {
  value: string;
  align?: "left" | "center" | "right" | "inherit" | "justify";
};

type GridCellProps<T,K> = {
  rowObject: HeaderGridCustom;
  index: number;
  element: Record<string, any>;
  headerNames: HeaderGridCustom[];
  apiGet?: (element: Record<string, any>) => void;
  cssFirstColum?: any;
  cssFirstColumRagioneSociale?: any;
  flexCenterStyle?: any;
  isRowOpen?: boolean;
  onToggleRow?: () => void;
  setAction?: (obj:T, action:string) => void;
  manageCheckbox?: (currentRow:Record<string, any>) => Record<string, any>;
  manageCheckboxCollapse?: (currentRow:Record<string, any>) => Record<string, any>;
  getAsyncDetails?:(currentRow:Record<string, any>,val?:boolean) => void,
  selectedRows?:Record<string, any>[],
  manageStateCheckbox?:(currentRow:Record<string, any>,val:string,array:Record<string, any>[]) => {verifyIfSelected:boolean,disabled:boolean},
  usedInside?:string
};

const flexCenterStyle: SxProps<Theme> = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: 1,
};

const getCssFirstColumRagioneSociale = (isClickable: boolean): SxProps<Theme> => ({
  color: '#0D6EFD',
  fontWeight: 'bold',
  cursor: isClickable ? 'pointer' : 'default',
  width:"350px"
});

const getCssFirstColumCustom = (isClickable: boolean,width?:string|undefined): SxProps<Theme> => ({
  color: '#0D6EFD',
  fontWeight: 'bold',
  cursor: isClickable ? 'pointer' : 'default',
  width:width ? width : undefined

});

const cssFirstColum : SxProps<Theme> = {
  color:'#0D6EFD',
  fontWeight: 'bold',
  cursor: 'pointer',
};

const GridCell = <T, K> ({
  rowObject,
  index: i,
  element,
  headerNames,
  apiGet,
  isRowOpen,
  onToggleRow,
  setAction,
  manageCheckbox,
  manageCheckboxCollapse,
  getAsyncDetails,
  selectedRows=[],
  manageStateCheckbox,
  usedInside=""
}: GridCellProps<T, K>) => {
  const value = element[rowObject.keyValue];


 

  switch (rowObject.typeColumn) {
  case "string": {
    const isLong = value?.toString().length > 24;
    return (
      <Tooltip key={`${i}-${value}`} title={isLong ? value : null}>
        <TableCell
          onClick={() => {if (apiGet && headerNames[i]?.makeAction) apiGet(element); }}
          align="center"
          width={headerNames[i]?.width}
        >
          <Typography sx={headerNames[i]?.makeAction ? cssFirstColum : null} variant={rowObject.variant||"body1"}>
            {value
              ? isLong
                ? value.toString().slice(0, 10) + "..."
                : value
              : "--"}
          </Typography>
        </TableCell>
      </Tooltip>
    );
  }
  case "data-exeption": {
    return (  
      <TableCell  width={headerNames[i]?.width} key={`${i}-${value}`} align="center">
        <Typography variant={rowObject.variant||"body1"}>
          {rowObject.funToManipulateValue ? rowObject.funToManipulateValue(element):"--"}
        </Typography>
      </TableCell>
    );
  }
  case "number":
    return (
      <TableCell  width={headerNames[i]?.width} align="center">
        <Typography variant={rowObject.variant||"body1"}>
          {value === null ? "--" : value}
        </Typography>
      </TableCell>
    );
  case "boolean":
    return (
      <TableCell width={headerNames[i]?.width} align="center">
        <Typography variant={rowObject.variant||"body1"}>
          {value === null ? "--" : value === true ? "Si" : "No"}
        </Typography>
      </TableCell>
    );
  case "mese-number":
    return <TableCell width={headerNames[i]?.width} align="center">
      <Typography variant={rowObject.variant||"body1"}>
        {mesiGrid[value] || "--"}
      </Typography>
    </TableCell>;
  case "ragionesociale": {
    const isLong = value?.toString().length > 40;
    return (
      <Tooltip key={`${i}-${value}`} title={isLong ? value : null}>
        <TableCell
          onClick={() => {
            if (apiGet && headerNames[i]?.makeAction) apiGet(element);
          }}
          width={headerNames[i]?.width}
          align={i === 0 ? "left" : "center"}
        >
          <Typography sx={headerNames[i]?.applyCss ? getCssFirstColumRagioneSociale(headerNames[i]?.makeAction||false) : null} variant={rowObject.variant||"body1"}>
            {isLong ? value?.toString().slice(0, 37) + "..." : value}
          </Typography>
        </TableCell>
      </Tooltip>
    );
  }

  case "data": {
    let valueData = value !== null ? transformDateTimeWithNameMonth(value) : "--";
    if (rowObject.keyValue === "dataChiusura") {
      valueData =
          element.source === "archiviato"
            ? "--"
            : element.source === "facoltativo"
              ? "TBD"
              : transformDateTimeWithNameMonth(element.dataChiusura);
    }
    return (
      <TableCell key={`${i}-${value}`}  width={headerNames[i]?.width} align="center">
        <Typography variant={rowObject.variant||"body1"}>
          {valueData || "--"}
        </Typography>
      </TableCell>
    );
  }
  case "string-tipocontratto":
    return (
      <Tooltip key={`${i}-${value}`} title={ value === null ? null : value === 'PAL' ? 'PAC - PAL senza requisiti' : 'PAC - PAL con requisiti'}>
        <TableCell key={`${i}-${value}`} width={headerNames[i]?.width} align="center">
          <Typography variant={rowObject.variant||"body1"}>
            { value === null ? "--" : value === 'PAL' ? ('PAC - PAL senza requisiti').slice(0, 10) + "..." : ('PAC - PAL con requisiti').slice(0, 10) + "..."}
          </Typography>
        </TableCell>
      </Tooltip>
    );
  case "number-tipocontratto":
    return (
      <Tooltip key={`${i}-${value}`} title={ Number(value) === null ? null : Number(value) === 1 ? 'PAC - PAL senza requisiti' : 'PAC - PAL con requisiti'}>
        <TableCell key={`${i}-${value}`} width={headerNames[i]?.width} align="center">
          <Typography variant={rowObject.variant||"body1"}>
            { Number(value)  === null ? "--" : Number(value)  === 1 ? ('PAC - PAL senza requisiti').slice(0, 10) + "..." : ('PAC - PAL con requisiti').slice(0, 10) + "..."}
          </Typography>
        </TableCell>
      </Tooltip>
    );
  case "data-ora": {
    const valueData = value ? transformDateTime019(value) : "";
    return (
      <TableCell key={`${i}-${value}`} width={headerNames[i]?.width} align="center">
        <Typography variant={rowObject.variant||"body1"}>
          {valueData || "--"}
        </Typography>
      </TableCell>
    );
  }
  case "euro-centesimi":
    return (
      <TableCell key={`${i}-${value}`}  width={headerNames[i]?.width} align="center">
        <Typography variant={rowObject.variant||"body1"}>
          {(value !== null && value !== 0)
            ? (Number(value) / 100).toLocaleString("de-DE", {
              style: "currency",
              currency: "EUR",
            })
            : "--"}
        </Typography>
      </TableCell>
    );
  case "euro":
    return (
      <TableCell key={`${i}-${value}`} width={headerNames[i]?.width} align="center">
        <Typography variant={rowObject.variant||"body1"}>
          {(value !== null && value !== 0)
            ? Number(value).toLocaleString("de-DE", {
              style: "currency",
              currency: "EUR",
            })
            : "--"}
        </Typography>
      </TableCell>
    );
  case "euro-number":
    return (
      <TableCell key={`${i}-${value}`} width={headerNames[i]?.width} align="center">
        <Typography variant={rowObject.variant||"body1"}>
          {value != null
            ? value.toLocaleString("de-DE", {
              style: "currency",
              currency: "EUR",
              maximumFractionDigits: 14
            })
            : "--"}
        </Typography>
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
    return (
      <TableCell key={`${i}-checkbox`} align="center">
        <Checkbox 
          disabled={manageStateCheckbox && manageStateCheckbox(element,usedInside,selectedRows)?.disabled}
          checked={manageStateCheckbox && manageStateCheckbox(element,usedInside,selectedRows)?.verifyIfSelected}
          onChange={(event) =>{
            console.log({event:event.target.checked});
            if(manageCheckbox){
              //setChecked(event.target.checked);
              if (getAsyncDetails && !isRowOpen){
                if (onToggleRow) onToggleRow();
                getAsyncDetails(element,true);
              }
              manageCheckbox(element);
              
            }

            if(manageCheckboxCollapse){
              //setChecked(event.target.checked);
              manageCheckboxCollapse(element);
            }
          } }/>
      </TableCell>
    );
  case "chip": {
    const formattedLabel = value
      ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
      : "--";
    const bgColor =
        rowObject.funToManipulateValue && rowObject.keyToManipulateData
          ? rowObject.funToManipulateValue(element)
          : undefined;
    return (
      <TableCell key={`${i}-${value}`} width={headerNames[i]?.width} align="center">
        <Chip
          variant="outlined"
          label={formattedLabel}
          sx={{ backgroundColor: bgColor }}
        />
      </TableCell>
    );
  }
  case "chip-tooltip": {
    const objTooltip = rowObject.funToManipulateValue ? rowObject.funToManipulateValue(element) : undefined;
    return (
      <Tooltip key={`${i}-${value}`} title={objTooltip?.title}>
        <TableCell key={`${i}-${value}`} width={headerNames[i]?.width} align="center">
          <Chip
            variant="outlined"
            label={objTooltip?.label }
            sx={{ backgroundColor: objTooltip?.color }}
          />
        </TableCell>
      </Tooltip>
    );
  }
  case "action": {
    return (
      <TableCell key={`${i}-${value}`} width={headerNames[i]?.width} align="center">
        {rowObject.funToManipulateValue && rowObject.funToManipulateValue(element,setAction)}
      </TableCell>
    );
  }
  case "custom-value": {
    return (
      <TableCell
        key={`${i}-${value}`}
        onClick={() => {
          if (apiGet && headerNames[i]?.makeAction) apiGet(element);
        }}
        sx={headerNames[i]?.applyCss ? getCssFirstColumCustom(headerNames[i]?.makeAction||false,headerNames[i]?.width) : null}
      
        align="center">
        {rowObject.funToManipulateValue && rowObject.funToManipulateValue(element,apiGet)}
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
      <TableCell width={headerNames[i]?.width} key={`expand-${element.id}-${i}`} align="center">
        <IconButton
          sx={{ color: "#227AFC" }}
          aria-label="expand row"
          size="small"
          onClick={() =>{
            if (onToggleRow) onToggleRow();
            if (getAsyncDetails && !isRowOpen) getAsyncDetails(element);
          } }
        >
          {isRowOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </IconButton>
      </TableCell>
    );
  case "arrow":
    return (
      <TableCell width={headerNames[i]?.width} key={`${i}-arrow`} align="center">
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
