import { postXmlHttp } from "./BackendClient";
import type { NotificationDescription } from "./Components/NotificationProvider";
import fileConfig from './Configs/uploads.config';

export function ValidateFileTypeAndSize(files: File[], notify: (descriptor: NotificationDescription) => void): File[] {

    const filesPass: File[] = [];

    for (let i = 0; i < files.length; i++){
        const file = files[i];

        if (!['image/png', 'image/jpeg', 'imgae/webp'].includes(file.type)) {
            notify({
                type: 'warning',
                header: 'Incorrect file format selected!',
                message: 'File uploads only support .png, .jpeg, and .webp formats.'
            });
            continue;
        }
        if (file.size > fileConfig.maxFilesizeBytes) {
            notify({
                type: 'warning',
                header: 'File is too large!',
                message: `The file you are trying to upload is too large (${(file.size / (1024 * 1024)).toFixed(2)}MB), maximum file size is 5MB`
            });
            continue;
        }

        filesPass.push(file);
    }

    return filesPass;
}

export async function UploadFilesToServer(endpoint: string, files: File[]): Promise<UploadResult[]>
{
    const promises: Promise<UploadResult>[] = [];

    files.forEach((file, index) => {
        const uploadPromise = UploadFileToServer(endpoint, file, [{ key: "index", value: index.toString() }])
        promises.push(uploadPromise);
    });

    const results = await Promise.allSettled(promises);
    const successfulUploads: UploadResult[] = []
    
    results.forEach(result => {
        if (result.status != 'fulfilled')
            return;

        successfulUploads.push(result.value);
    })

    return successfulUploads;
}

export async function UploadFileToServer(endpoint: string, file: File, headerData?: [{ key: string, value: string}]): Promise<UploadResult> {
    
    const formData = new FormData();
    formData.append('file', file);

    return postXmlHttp<UploadResult>(endpoint, formData, () => {}, headerData);
}

export type UploadResult = {
    id: string,
    url: string
};