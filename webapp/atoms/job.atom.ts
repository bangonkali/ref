import { atom } from "recoil";
import { IJob } from "../orm/models/Job";

const jobsState = atom<IJob[]>({
    key: 'jobsState',
    default: [],
});

export default jobsState;