"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Input } from "./ui/input";
import { usePathname, useSearchParams } from "next/navigation";
import { getFiles } from "@/lib/actions/file.actions";
import { Models } from "node-appwrite";
import Thumbnail from "./Thumbnail";
import FormattedDateTime from "./FormattedDateTime";
import { useRouter } from "next/navigation";
import { useDebounce } from "use-debounce";

const Search = () => {
  const [query, setquery] = useState("");
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("query") || "";
  const [results, setresults] = useState<Models.Document[]>([]);
  const [open, setopen] = useState(false);
  const router = useRouter();
  const path = usePathname();
  const [debouncedQuery] = useDebounce(query, 500);
  useEffect(() => {
    if (!searchQuery) {
      setquery("");
    }
  }, [searchQuery]);
  useEffect(() => {
    const fetchFiles = async () => {
      if (debouncedQuery.length === 0) {
        setresults([]);
        setopen(false);
        return router.push(path.replace(searchParams.toString(), ""));
      }
      const files = await getFiles({ types: [], searchText: debouncedQuery });
      setresults(files.documents);
      setopen(true);
    };
    fetchFiles();
  }, [debouncedQuery]);
  const handleClickItem = (file: Models.Document) => {
    setopen(false);
    setresults([]);
    router.push(
      `/${file.type === "video" || file.type === "audio" ? "media" : file.type + "s"}?query=${query}`
    );
  };
  return (
    <div className="search">
      <div className="search-input-wrapper">
        <Image
          src="/assets/icons/search.svg"
          alt="search"
          width={24}
          height={24}
        />
        <Input
          value={query}
          placeholder="Search..."
          className="search-input"
          onChange={(e) => setquery(e.target.value)}
        />

        {open && (
          <ul className="search-result">
            {results.length > 0 ? (
              results.map((file) => (
                <li
                  key={file.$id}
                  className="flex items-center justify-between"
                  onClick={() => handleClickItem(file)}
                >
                  <div className="flex cursor-pointer items-center gap-4">
                    <Thumbnail
                      type={file.type}
                      extension={file.extension}
                      url={file.url}
                      className="size-9 min-w-9"
                    />
                    <p className="subtitle-2 line-clamp-1 text-light-100">
                      {file.name}
                    </p>
                  </div>
                  <FormattedDateTime
                    date={file.$createdAt}
                    className="caption line-clamp-1 text-light-100"
                  />
                </li>
              ))
            ) : (
              <p className="empty-result">No Files found</p>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Search;
