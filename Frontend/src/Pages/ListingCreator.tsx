import { useState, type ChangeEvent, type FormEvent } from "react"
import { useNotification, type NotificationDescription } from "../Components/NotificationProvider";
import Button from "../Components/Button";
import { postAuthorized, postXmlHttp } from "../BackendClient";

type UploadResult = {
    id: string,
    url: string
}

export default function LisitngCreator() {

    const maxSizeBytes = 5 * 1024 * 1024;

    const notify = useNotification();

    const [file, setFile] = useState<File | null>(null);
    const [progress, setProgress] = useState<number>(0);
    const [imageGuid, setImageGuid] = useState<string>('');
    const [listingData, setListingData] = useState({
        title: '',
        description: '',
        price: '',
        currency: ''
    })

    const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const f = event.target.files?.[0] ?? null;

        if (!f) return;
        if (!['image/png', 'image/jpeg', 'imgae/webp'].includes(f.type)) {
            const notifObject: NotificationDescription = {
                type: 'warning',
                header: 'Incorrect file format selected!',
                message: 'File uploads only support .png, .jpeg, and .webp formats.'
            }
            notify(notifObject);
            return;
        }
        if (f.size > maxSizeBytes) {
            const notifObject: NotificationDescription = {
                type: 'warning',
                header: 'File is too large!',
                message: `The file you are trying to upload is too large (${(f.size / (1024 * 1024)).toFixed(2)}MB), maximum file size is 5MB`
            }
            notify(notifObject);
            return;
        }

        setFile(f);
    }

    const uploadFile = async () => {
        if (!file) return;
        const formData = new FormData();
        formData.append("Authorization", `Bearer ${sessionStorage.getItem("JWT")}`)
        formData.append('file', file);

        const onProgress = (event: ProgressEvent) => {
            if (event.lengthComputable) {
                setProgress(event.loaded / event.total);
                console.log(`progress: ${progress}`);
            }
        }

        const response = await postXmlHttp<UploadResult>('Images/UploadImage', formData, notify, onProgress);

        setImageGuid(response.id);
        console.log(`resp: ${response.id}, stateguid: ${imageGuid}`);
    };

    const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setListingData(prev => ({
            ...prev,
            [name]: value,
        }));
    }

    const onListingSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        console.log(imageGuid);

        const listing = {
            title: listingData.title,
            description: listingData.description,
            price: +listingData.price,
            currency: listingData.currency,
            linkedImages: [
                imageGuid
            ]
        }

        const response = await postAuthorized('Listings/CreateListing', listing);

        console.log(response);
    }

    return(
        <div>
            <label>
                Select image
                <input type="file" accept="image/*" onChange={onFileChange}></input>
            </label>
            <Button onClick={uploadFile} disabled={!file}>
                Upload
            </Button>
            <form onSubmit={onListingSubmit}>
                <input type="text" onChange={onInputChange} required name="title" className="textinput-standard" placeholder="Title"></input>
                <input type="text" onChange={onInputChange} required name="description" className="textinput-standard" placeholder="Description"></input>
                <input type="text" onChange={onInputChange} required name="price" className="textinput-standard" placeholder="Price"></input>
                <input type="text" onChange={onInputChange} required name="currency" className="textinput-standard" placeholder="Currency"></input>
                <Button className="px-2 py-1" variant="filled" type="submit">Submit</Button>
            </form>
        </div>
    )
}