export interface GetCommit {
    url: string;
    sha: string;
    html: string;
    files: [
        {
            sha: string;
            filename: string;
            status: string;
            additions: number;
            deletions: number;
            blob_url: string;
            raw_url: string;
            contents_url: string;
            patch: string;
        }
    ];
}
