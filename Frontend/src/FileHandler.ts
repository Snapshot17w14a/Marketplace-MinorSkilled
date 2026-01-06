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

export async function UploadFilesToServer(files: File[]): Promise<string[]>
{
    var promises: Promise<UploadResult>[] = [];

    files.forEach(file => {
        const formData = new FormData();
        formData.append("file", file);

        const uploadPromise = postXmlHttp<UploadResult>("Images/UploadImage", formData);
        promises.push(uploadPromise);
    });

    await Promise.allSettled(promises);

    const successfulUploads: string[] = [];

    for (let i = 0; i < promises.length; i++) {
        const result = await promises[i];
        successfulUploads.push(result.id);
    }

    return successfulUploads;
}

export type UploadResult = {
    id: string,
    url: string
};