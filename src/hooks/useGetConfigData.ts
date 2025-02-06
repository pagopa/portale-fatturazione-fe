import { useEffect, useState } from "react";

function useGetConfigData(jsonConfig,data) {

    const [dataManipulated, setDataManipulated] = useState({});
    const headersItems = jsonConfig.map(el => el.headersItem);
    /*
    useEffect(()=>{
        dataManipulated;
       const result = data.map((el)=>{
        switch(el.type) {
            case "value":
              return
              break;
            case y:
              // code block
              break;
            default:
              // code block
          }
       })
       

    },[data]);
*/
 
    return { dataManipulated, headersItems };
}

export default useGetConfigData;


