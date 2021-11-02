import { selector } from "recoil";
import { IJob } from "../orm/models/Job";
import jobsState from "./job.atom";
import uploadResponsesState from "./uploadResponses.atom";

const jobResultsSelector = selector<IJob[]>({
    key: 'jobResultsSelector',
    get: ({ get }) => {
        const jobs = get(jobsState);
        const uploadResponses = get(uploadResponsesState);

        console.log("jobs: " + jobs.length);
        console.log("uploadResponses: " + uploadResponses.length);

        const filteredJobs = jobs.filter((job) => {
            const jobKeys = uploadResponses.flatMap((response) => response.jobs);
            return jobKeys.includes(job.key);
        });

        return filteredJobs;
    },
});

export default jobResultsSelector;