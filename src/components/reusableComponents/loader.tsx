import { SingleFileInput } from "@pagopa/mui-italia";
import React, { useState } from "react";
import DownloadIcon from '@mui/icons-material/Download';

const Loader : React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const handleSelect = (file: File) => {
        setFile(file);
    };
    const handleRemove = () => {
        setFile(null);
    };

    
    return  <SingleFileInput  value={file} onFileSelected={handleSelect} onFileRemoved={handleRemove} loadingLabel='Downloading .....' loading={true} dropzoneLabel={''}/>;

};

export default Loader;