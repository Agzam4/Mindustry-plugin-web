import { useDropzone, type DropzoneOptions, type FileWithPath } from "react-dropzone";
import style from './Dnd.module.scss'
import { Icons } from "./icons";
import { useEffect } from "react";


interface DndProps {
    options?: DropzoneOptions
    onFilesChange?: (files: readonly FileWithPath[]) => void;
}
export default function Dnd({ options, onFilesChange }: DndProps) {
    const { acceptedFiles, getRootProps, getInputProps } = useDropzone(options);

    useEffect(() => {
        if (onFilesChange) {
            onFilesChange(acceptedFiles);
        }
    }, [acceptedFiles, onFilesChange]);

    const files = acceptedFiles.map(file => (
        <div key={file.path}>
            {file.name} ({file.size} bytes)
        </div>
    ));

    return (
        <section className={style.container}>
            <div {...getRootProps({ className: style.dropzone })}>
                <div className={style.icon}><Icons.upload /></div>
                <input {...getInputProps()} />
                {
                    acceptedFiles.length ? files : <div>Drop files here, or click to select</div>
                }
            </div>
        </section>
    );
}
