export interface IJob {
    key: string,
    completed: boolean,
    filename: string,
    failed?: boolean,
    output_filename?: string,
    output_key?: string,
    returncode?: number,
    stderr?: string,
    stdout?: string,
}

export default class Job implements IJob {
    constructor(
        public key: string,
        public completed: boolean,
        public filename: string,
        public failed?: boolean,
        public output_filename?: string,
        public output_key?: string,
        public returncode?: number,
        public stderr?: string,
        public stdout?: string,
    ) {
    }
}