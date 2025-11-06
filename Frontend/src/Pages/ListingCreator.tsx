import { useState, type ChangeEvent, type FormEvent } from "react"
import { useNotify, type NotificationDescription } from "../Components/NotificationProvider";
import Button from "../Components/Button";
import { postAuthorized, postXmlHttp } from "../BackendClient";
import TopNavigation from "../Components/TopNavigation";
import ProgressBar from "../Components/ProgressBar";
import { useNavigate } from "react-router-dom";

export default function LisitngCreator() {

    const naviagate = useNavigate();

    const [imageGuids, setImageGuids] = useState<string[]>([]);
    const [listingData, setListingData] = useState({
        title: '',
        description: '',
        price: '',
        currency: ''
    })

    const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setListingData(prev => ({
            ...prev,
            [name]: value,
        }));
    }

    const onListingSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        console.log(imageGuids);

        const listing = {
            title: listingData.title,
            description: listingData.description,
            price: +listingData.price,
            currency: listingData.currency,
            linkedImages: imageGuids
        }

        const response = await (await postAuthorized('Listings/CreateListing', listing)).json();

        naviagate(`/listing/${response.guid}`);
    }

    return(
        <div className="h-screen min-h-screen">
            <TopNavigation className="" />
            <div className='flex p-4 pt-16 text-center h-full flex-warp flex-col'>
                <h1 className="font-bold text-5xl mt-4">Create a listing</h1>
                <ImageUpload setImageGuids={setImageGuids}/>
                <div className="basis-full mt-4 text-start p-4">
                    <h1 className="font-bold text-4xl">Details</h1>
                    <form onSubmit={onListingSubmit}>
                        <input type="text" onChange={onInputChange} required name="title" className="textinput-standard" placeholder="Title"></input>
                        <input type="text" onChange={onInputChange} required name="description" className="textinput-standard" placeholder="Description"></input>
                        <input type="text" onChange={onInputChange} required name="price" className="textinput-standard" placeholder="Price"></input>
                        <input type="text" onChange={onInputChange} required name="currency" className="textinput-standard" placeholder="Currency"></input>
                        <Button className="px-2 py-1" variant="filled" type="submit">Submit</Button>
                    </form>
                </div>
            </div>
        </div>
    )
}

function ImageUpload( { setImageGuids } : { setImageGuids: React.Dispatch<React.SetStateAction<string[]>> }) {

    const maxSizeBytes = 5 * 1024 * 1024;

    const notify = useNotify();

    const [files, setFiles] = useState<UploadFile[] | null>(null);

    const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {

        if (!event.target.files)
            return

        const filesPass: File[] = [];

        for(let i = 0; i < event.target.files.length; i++){
            const file = event.target.files[i];

            if (!['image/png', 'image/jpeg', 'imgae/webp'].includes(file.type)) {
                const notifObject: NotificationDescription = {
                    type: 'warning',
                    header: 'Incorrect file format selected!',
                    message: 'File uploads only support .png, .jpeg, and .webp formats.'
                }
                notify(notifObject);
                continue;
            }
            if (file.size > maxSizeBytes) {
                const notifObject: NotificationDescription = {
                    type: 'warning',
                    header: 'File is too large!',
                    message: `The file you are trying to upload is too large (${(file.size / (1024 * 1024)).toFixed(2)}MB), maximum file size is 5MB`
                }
                notify(notifObject);
                continue;
            }

            filesPass.push(file);
        }

        setFiles(filesPass.map(f => {
            const uFile: UploadFile = {
                file: f,
                progress: 0,
                success: false,
                preview: URL.createObjectURL(f)
            };
            
            return uFile;
        }));
    };

    const uploadFile = async () => {
        if (!files) return;

        console.log('upld');
        let uploadPromises
        try{
         uploadPromises = files.map(async (uFile, index) => {
            
            const formData = new FormData();
            formData.append('file', uFile.file);

            const onProgress = (event: ProgressEvent) => {
                if (event.lengthComputable) {
                    setFiles(updateUFileAtIndex(index, event.loaded / event.total));
                    console.log(`progress: ${uFile.progress}`);
                }
            }

            return postXmlHttp<UploadResult>('Images/UploadImage', formData, onProgress)
        });
        }
        catch(e){console.log(e); return;}
        const results = await Promise.allSettled(uploadPromises);

        const successfullGuids: string[] = [];

        results.forEach((result, index) => {
            if (result.status === 'fulfilled'){
                const { id } = result.value;
                successfullGuids.push(id);

                setFiles(prev => {
                    if (!prev) return prev;
                    const updated = [...prev];
                    updated[index].success = true;
                    return updated;
                });
            }
            else {
                notify({
                    type: 'error',
                    header: "Upload failed!",
                    message: `File ${files[index].file.name} cound not be uploaded.\n${result.reason}`
                })
            }
        })

        setImageGuids(successfullGuids);
    };
    
    const updateUFileAtIndex = (index: number, progress: number): UploadFile[] | null => {
        if (!files) return files

        const prevFiles = [...files];
        prevFiles[index].progress = progress;

        return prevFiles;
    }

    return(
        <div className="basis-full px-4 mt-4 flex flex-col">
            <div className="flex justify-between items-center h-min mb-4">
                <h1 className="inline-block font-bold text-4xl">Images</h1>
                <span>
                    <label className="mx-2 border-2 border-white px-2 py-[7.5px] rounded-lg hover:bg-white hover:text-black transition-all duration-300 ease-in-out font-bold cursor-pointer">
                        Select image
                        <input hidden multiple type="file" accept="image/*" onChange={onFileChange}></input>
                    </label>
                    <Button className="mx-2 px-2 py-1" onClick={uploadFile} disabled={!files}>
                        Upload
                    </Button>
                </span>
            </div>
            <div className="bg-(--mid-dark) border-2 border-(--light-dark) p-2 rounded-lg basis-full grid lg:grid-cols-6 grid-cols-1 gap-2">
                {files && 
                    files.map((file, index) => {
                        return(<FilePreview uFile={file} key={index}/>)
                    })
                }
            </div>
        </div>
    )
}

function FilePreview({ uFile }: { uFile: UploadFile }) {
    return(
        <div className="ring-2 ring-(--light-dark) rounded-lg h-full p-4 flex flex-col justify-between shrink-0">
            <div>
                <h1>{uFile.file.name}</h1>
                <div className="rounded-lg overflow-clip ring-2 ring-(--light-dark) my-2 h-36 object-contain object-center">
                    <img src={uFile.preview}></img>
                </div>
            </div>
            {uFile.success && <p>uploaded successfully</p>}
            <ProgressBar progress={uFile.progress} className="w-full"/>
        </div>
    )
}

type UploadResult = {
    id: string,
    url: string
};

type UploadFile = {
    file: File,
    progress: number,
    success: boolean
    preview: string
};