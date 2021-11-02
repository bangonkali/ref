import { atom } from "recoil";
import { UploadResponse } from "../pages/api/upload";

const uploadResponsesState = atom<UploadResponse[]>({
    key: 'uploadResponses',
    default: [],
});

export default uploadResponsesState;