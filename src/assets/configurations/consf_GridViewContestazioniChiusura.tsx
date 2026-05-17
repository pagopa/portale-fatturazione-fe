
export const headersNameGridViewChiusura: {
  label: string;
  align: string;
  width: number | string;
  headerAction: boolean;
  renderCell?: (param: any, param2: string) => JSX.Element;
  keyObj?: string;
}[] = [
  { label: "Tipologia Fattura",align: "center", width: "200px", headerAction: false, keyObj: "tipologiaFattura" },
  { label: "Id Flag Contestazione",align: "center", width: "200px", headerAction: false, keyObj: "idFlagContestazione" },
  { label: "Tot. Not. Analogiche",align: "center", width: "200px", headerAction: false, keyObj: "totaleNotificheAnalogiche" },
  { label: "Accettate",align: "center", width: "150px", headerAction: false, keyObj: "acc" },
  { label: "Rifiutate",align: "center", width: "150px", headerAction: false, keyObj: "rif" },
  { label: "",align: "center", width: "100px", headerAction: false, keyObj: "icon" }
];
