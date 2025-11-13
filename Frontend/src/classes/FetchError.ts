export class FetchError extends Error{

    public readonly code: number;
    public readonly error: string;

    constructor(code: number, error: string) {
        super();
        
        this.code = code;
        this.error = error;
    }
}