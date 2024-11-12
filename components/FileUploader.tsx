"use client";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./ui/button";
import { cn, convertFileToUrl, getFileType } from "@/lib/utils";
import Image from "next/image";
import Thumbnail from "./Thumbnail";
import { MAX_FILE_SIZE } from "@/constants";
import { useToast } from "@/hooks/use-toast";
import { uploadFile } from "@/lib/actions/file.actions";
import { usePathname } from "next/navigation";

interface Props {
  ownerId: string;
  accountId: string;
  className?: string;
}

const FileUploader = ({ ownerId, accountId, className }: Props) => {
  const path = usePathname();
  const { toast } = useToast();
  const [files, setfiles] = useState<File[]>([]);
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // Do something with the files
      setfiles(acceptedFiles);
      const uploadPromices = acceptedFiles.map(async (file) => {
        // uploadFile({file,ownerId,accountId,path})
        if (file.size > MAX_FILE_SIZE) {
          setfiles((prevFiles) =>
            prevFiles.filter((prevFile) => prevFile.name !== file.name)
          );
          return toast({
            description: (
              <p className="body-2 text-brand">
                <span className="font-semibold">{file.name}</span>
                is too large. Max file size is 50MB.
              </p>
            ),
            className: "error-toast",
          });
        }
        return uploadFile({ file, ownerId, accountId, path }).then(
          (uploadedFile) => {
            if (uploadedFile) {
              setfiles((prevFiles) =>
                prevFiles.filter((prevFile) => prevFile.name !== file.name)
              );
              toast({
                description: (
                  <p className="body-2 text-brand">
                    <span className="font-semibold">{uploadedFile.name}</span>{" "}
                    uploaded successfully.
                  </p>
                ),
                className: "success-toast",
              });
            }
          }
        );
      });
      await Promise.all(uploadPromices);
    },
    [ownerId, accountId, path, toast]
  );
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
  });
  const handleRemoveFile = (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>,
    fileName: string
  ) => {
    e.stopPropagation();
    const updatedFiles = files.filter((file) => file.name !== fileName);
    setfiles(updatedFiles);
  };

  return (
    <div {...getRootProps()} className="cursor-pointer">
      <input {...getInputProps()} />
      <Button type="button" className={cn("uploader-button", className)}>
        <Image
          src={"/assets/icons/upload.svg"}
          alt="upload"
          width={24}
          height={24}
        />
        <p>Upload</p>
      </Button>
      {files.length > 0 && (
        <ul className="uploader-preview-list">
          <h4 className="h4 text-light-100">Uploading...</h4>
          {files.map((file, index) => {
            const { type, extension } = getFileType(file.name);
            return (
              <li
                key={`${file.name}-${index}`}
                className="uploader-preview-item"
              >
                <div className="flex items-center gap-3">
                  <Thumbnail
                    type={type}
                    extension={extension}
                    url={convertFileToUrl(file)}
                  />
                  <div className="preview-item-name">
                    {file.name}
                    <Image
                      src={"/assets/icons/file-loader.gif"}
                      alt="upload-image"
                      width={80}
                      height={26}
                    />
                  </div>
                </div>
                <Image
                  src={"/assets/icons/remove.svg"}
                  width={24}
                  height={24}
                  alt="remove-icon"
                  onClick={(e) => handleRemoveFile(e, file.name)}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default FileUploader;
