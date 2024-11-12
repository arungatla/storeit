import { Models } from "node-appwrite";
import React from "react";
import Thumbnail from "./Thumbnail";
import FormattedDateTime from "./FormattedDateTime";
import { formatDateTime } from "@/lib/utils";
import { Button } from "./ui/button";
import Image from 'next/image';

const ImageThumbnail = ({ file }: { file: Models.Document }) => (
  <div className="file-details-thumbnail">
    <Thumbnail
      type={file.type}
      extension={file.extension}
      url={file.url}
      className="!size-20"
      imageClassName="!size-11"
    />
    <div className="flex flex-col">
      <p className="subtitle-2 mb-1">{file.name}</p>
      <FormattedDateTime date={file.$createdAt} className="caption" />
    </div>
  </div>
);

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex">
    <p className="file-details-label text-left">{label}</p>
    <p className="file-details-value text-left">{value}</p>
  </div>
);

export const FileDetails = ({ file }: { file: Models.Document }) => {
  return (
    <>
      <ImageThumbnail file={file} />
      <div className="space-y-4 px-2 py-2">
        <DetailRow label="Format:" value={file.extension} />
        <DetailRow label="Size:" value={file.size} />
        <DetailRow label="Owner:" value={file.owner.fullName} />
        <DetailRow label="Last edit:" value={formatDateTime(file.$updatedAt)} />
      </div>
      {/* <DetailRow label="Format:" value={file.extension} /> */}
    </>
  );
};

type Props = {
  file: Models.Document;
  onInputChange: React.Dispatch<React.SetStateAction<string[]>>;
  onRemove: (email: string) => void;
};

export const ShareInput = ({ file, onInputChange, onRemove }: Props) => {
  return (
    <>
    <ImageThumbnail file={file} />
    <div className="share-wrapper">
      <p className="subtitle-2 pl-1 text-light-100">
        Share file with other users.
      </p>
        <input
            type="email"
            placeholder="Enter email address"
            className="share-input-field"
            onChange={(e)=>onInputChange(e.target.value.trim().split(','))}
        />
        <div className="pt-4">
            <div className="flex justify-between">
                <p className="subtitle-2 text-light-100">Share with</p>
                <p className="subtitle-2 text-light-200">{file.users.length} users</p>
            </div>
      <ul className="pt-2">
        {file.users.map((email:string) => (
            <li key={email} className="flex items-center gap-2 justify-between">
                <p className="subtitle-2">{email}</p>
                <Button
          className="share-remove-user"
                onClick={() => onRemove(email)}
                >
                <Image
                    src={"/assets/icons/remove.svg"}
                    alt="remove"
                    width={24}
                    height={24}
                />
                </Button>
            </li>
        )
        )}
      </ul>
        
        </div>

    </div>

    </>
  )
};