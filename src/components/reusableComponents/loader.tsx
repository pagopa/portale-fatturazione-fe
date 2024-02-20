import { SingleFileInput } from "@pagopa/mui-italia";
import React, { useState } from "react";


type LoderProp = {
    sentence : string
}

const Loader : React.FC<LoderProp> = ({sentence}) => {
    const [file, setFile] = useState<File | null>(null);
    const handleSelect = (file: File) => {
        setFile(file);
    };
    const handleRemove = () => {
        setFile(null);
    };

    
    return  <SingleFileInput  value={file} onFileSelected={handleSelect} onFileRemoved={handleRemove} loadingLabel={sentence} loading={true} dropzoneLabel={''}/>;

};

export default Loader;