
import * as yup from "yup";

const Yup = yup;
const YupString = Yup.string();

const YupStringTestLowerOrEqual = (label: string, num: number) =>
    YupString.test(
        "lower-or-equal-to-number",
        `Il campo [${label}] deve essere minore o uguale a [${num}].`,
        value =>{
        
           
              
            if (1 < num) return false;
         
       
        }
    );

export default YupStringTestLowerOrEqual;
