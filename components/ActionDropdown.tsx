"use client";
import { Models } from "node-appwrite";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { actionsDropdownItems } from "@/constants";
import Link from "next/link";
import { constructDownloadUrl } from "@/lib/utils";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { deleteFile, renameFile, updateFileUsers } from "@/lib/actions/file.actions";
import path from "path";
import { usePathname } from "next/navigation";
import { FileDetails, ShareInput } from "./ActionsModalContent";
import { close } from "node:inspector/promises";

const ActionDropdown = ({ file }: { file: Models.Document }) => {
  const [isModalopen, setisModalopen] = useState(false);
  const [isDropdownOpen, setisDropdownOpen] = useState(false);
  const [action, setaction] = useState<ActionType | null>(null);
  const [name, setname] = useState(file.name);
  const [isloading, setisloading] = useState(false);
  const [emails, setemails] = useState<string[]>([]);
  const path = usePathname();
  const closeAllModals = () => {
    setisModalopen(false);
    setisDropdownOpen(false);
    setaction(null);
    setname(file.name);
    setisloading(false);
    setemails([]);
  };
  const handleAction = async () => {
    if (!action) return;
    setisloading(true);
    let success = false;
    const actions = {
      rename: () =>
        renameFile({ fileId: file.$id, name, path, extension: file.extension }),
      share: () => updateFileUsers({ fileId: file.$id, emails, path }),
      delete: () => deleteFile({ fileId: file.$id, path,bucketFileId:file.bucketFileId }),
    };
    success = await actions[action.value as keyof typeof actions]();
    if (success) closeAllModals();
    setisloading(false);
  };
  const handleRemoveUser = async (email: string) => {
    const updatedEmails = emails.filter((e) => e !== email);
    const success = await updateFileUsers({
      fileId: file.$id,
      emails: updatedEmails,
      path,
    });
    if (success) setemails(updatedEmails);
    closeAllModals();
  };
  const renderDialogContent = () => {
    if (!action) return null;
    const { value, label } = action;
    return (
      <DialogContent className="shad-dialog-button">
        <DialogHeader className="flex flex-col gap-3">
          <DialogTitle className="text-center text-light-100">
            {label}
          </DialogTitle>
          {value === "rename" && (
            <Input
              type="text"
              value={name}
              onChange={(e) => setname(e.target.value)}
            />
          )}
          {value === "details" && <FileDetails file={file} />}
          {value === "share" && (
            <ShareInput
              file={file}
              onInputChange={setemails}
              onRemove={handleRemoveUser}
            />
          )}
            {value === "delete" && (
               <p className="delete-confirmation">
                Are you sure you want to delete <span className="delete-file-name">{file.name}</span>?
               </p>
            )}
        </DialogHeader>
        {["rename", "delete", "share"].includes(value) && (
          <DialogFooter className="flex flex-col gap-3 md:flex-row">
            <Button onClick={closeAllModals} className="modal-cancel-button">
              Cancel
            </Button>
            <Button onClick={handleAction} className="modal-submit-button">
              <p className="capitalize">{value}</p>
              {isloading && (
                <Image
                  src="/assets/icons/loader.svg"
                  alt="loader"
                  width={24}
                  height={24}
                  className="animate-spin"
                />
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    );
  };
  return (
    <Dialog open={isModalopen} onOpenChange={setisModalopen}>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setisDropdownOpen}>
        <DropdownMenuTrigger className="shad-no-focus">
          <Image
            src={"/assets/icons/dots.svg"}
            alt="dots"
            width={34}
            height={34}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel className="max-w-[200px] truncate">
            {file.name}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {actionsDropdownItems.map((item) => (
            <DropdownMenuItem
              key={item.value}
              className="shad-dropdown-item"
              onClick={() => {
                setaction(item);
                if (
                  ["rename", "share", "delete", "details"].includes(item.value)
                ) {
                  setisModalopen(true);
                }
              }}
            >
              {item.value === "download" ? (
                <Link
                  href={constructDownloadUrl(file.bucketFileId)}
                  download={file.name}
                  className="flex items-center gap-2"
                >
                  <Image
                    src={item.icon}
                    alt={item.label}
                    width={30}
                    height={30}
                  />
                  {item.label}
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Image
                    src={item.icon}
                    alt={item.label}
                    width={30}
                    height={30}
                  />
                  {item.label}
                </div>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {renderDialogContent()}
    </Dialog>
  );
};

export default ActionDropdown;
