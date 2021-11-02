import axios from "axios";
import util from "util";
import type { NextPage } from "next";
import React, { useState } from "react";
import { useSetRecoilState } from "recoil";
import uploadResponsesState from "../atoms/uploadResponses.atom";
import FileUploader, {
  FileSelectorError,
  FileUploaderError,
} from "../components/FileUploader";
import JobsList from "../components/JobsList";
import { UploadResponse } from "./api/upload";
import styles from "../styles/Home.module.css";

/**
 * This is the script for the Home Page.
 *
 * ## References:
 *
 * 1. https://stackoverflow.com/a/62547135/546506
 *
 * @returns Home Page
 */
const Home: NextPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const [error, setError] = useState<FileSelectorError | undefined>(undefined);
  const [isWaiting, setIsWaiting] = useState<boolean>(false);

  const setUploadResponses = useSetRecoilState(uploadResponsesState);

  const onFileSelect = (file: File) => {
    setSelectedFile(file);
    setError(undefined);
    console.log("File selected " + file.name);
  };

  const onFileSelectError = (error: FileSelectorError) => {
    setSelectedFile(undefined);
    setError(error);
  };

  const submitForm = () => {
    if (!selectedFile) return;

    setIsWaiting(true);

    const formData = new FormData();
    formData.append("name", selectedFile.name);
    formData.append("file", selectedFile);

    setSelectedFile(undefined);

    axios
      .post<UploadResponse>("/api/upload", formData)
      .then((res) => {
        setUploadResponses((prev) => {
          const next = [...prev, res.data];
          console.log(util.inspect(next));
          return next;
        });
      })
      .finally(() => {
        setIsWaiting(false);
      });
  };

  const canSubmit = selectedFile && !isWaiting;

  return (
    <div className={styles.container}>
      {!isWaiting && (
        <FileUploader
          extension={["mp4", "mov"]}
          sizeLimit={1024 * 1000 * 100}
          onFileSelect={onFileSelect}
          onFileSelectError={onFileSelectError}
          file={selectedFile}
          error={error}
        />
      )}
      {isWaiting && <img src="/Blocks-1s-200px.gif" width="50px" />}

      {!isWaiting && canSubmit && (
        <div className={styles.convert}>
          <button onClick={submitForm}>Convert</button>
        </div>
      )}

      <JobsList />
    </div>
  );
};

export default Home;
