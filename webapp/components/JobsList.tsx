import React, { FC } from "react";
import { useRecoilValue } from "recoil";
import jobResultsSelector from "../atoms/jobResults.selector";
import { IJob } from "../orm/models/Job";
import styles from "../styles/JobsList.module.css";

export type JobsListProps = {};

const JobsList: FC<JobsListProps> = () => {
  const jobs: IJob[] = useRecoilValue(jobResultsSelector);

  if (jobs.length === 0) {
    return <div></div>;
  }

  const rows = jobs
    .filter((job) => job.output_key && job.output_filename)
    .map((job) => {
      const url = "/api/download?key=" + job.output_key;
      return (
        <div key={job.output_key} className={styles.container}>
          <div className={styles.text}>{job.output_filename}</div>
          <a className={styles.upload} href={url}>
            Download
          </a>
        </div>
      );
    });

  return (
    <div>
      <h1>Output</h1>
      {rows}
    </div>
  );
};

export default JobsList;
