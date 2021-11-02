import React, { ChangeEvent, FC, useRef, useState } from "react";
import styles from "../styles/FileUploader.module.css";
import * as Humanize from "humanize-plus";

export type FileSelectorError = {
  message: FileUploaderError;
};

export type Props = {
  file: File | undefined;
  error: FileSelectorError | undefined;
  extension: string[];
  sizeLimit: number;
  onFileSelect: (file: File) => void;
  onFileSelectError: (error: FileSelectorError) => void;
};

export type FileUploaderError =
  | "no_file_selected_error"
  | "exceeded_size_limit_error"
  | "invalid_file_extension_error";

const FileUploader: FC<Props> = (props: Props) => {
  const fileInput = useRef<HTMLInputElement>(null);
  // const [txt, setTxt] = useState<string>(Select );

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (
      e.target.files === undefined ||
      e.target.files === null ||
      e.target.files.length === 0
    ) {
      props.onFileSelectError({
        message: "no_file_selected_error",
      });
      return;
    }

    const _file = e.target.files[0];

    if (!props.extension.some((ext) => _file.name.endsWith("." + ext))) {
      props.onFileSelectError({
        message: "invalid_file_extension_error",
      });
      return;
    }

    if (_file.size > props.sizeLimit) {
      props.onFileSelectError({
        message: "exceeded_size_limit_error",
      });
      return;
    } else {
      props.onFileSelect(_file);
    }
  };

  let txt: string = "Click to upload Mp4 File.";
  if (props.error?.message === "exceeded_size_limit_error") {
    const _size = Humanize.fileSize(props.sizeLimit);
    txt = `Upload files less than ${_size}`;
  } else if (props.error?.message === "invalid_file_extension_error") {
    txt = `Only upload Mp4 Files.`;
  } else if (props.file) {
    const _size = Humanize.fileSize(props.file.size);
    txt = `${props.file.name} (${_size})`;
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (fileInput.current) {
      fileInput.current.click();
    }
  };

  return (
    <div>
      <h1>Input</h1>
      <div className={styles.container}>
        <div className={styles.text}>
          <span>{txt}</span>
        </div>
        <button className={styles.upload} onClick={handleClick}>
          Upload
        </button>
      </div>
      <input
        style={{ visibility: "hidden" }}
        type="file"
        onChange={handleFileInput}
        ref={fileInput}
      />
    </div>
  );
};

export default FileUploader;
