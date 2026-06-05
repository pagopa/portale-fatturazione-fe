import YupString from "..";

const YupStringRequired = (label: string) =>
  YupString.required(`Il campo [${label}] è obbligatorio`);

export default YupStringRequired;
