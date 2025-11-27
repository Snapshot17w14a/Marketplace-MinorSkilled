import { useState, type ChangeEvent, type FormEvent, type JSX } from "react"
import { useNotify } from "../Components/NotificationProvider";
import Button from "../Components/Button";
import { postAuthorized, postXmlHttp } from "../BackendClient";
import TopNavigation from "../Components/TopNavigation";
import ProgressBar from "../Components/ProgressBar";
import { useNavigate } from "react-router-dom";
import DragElement from "../Components/DragElement";

export default function LisitngCreator() {

    const naviagate = useNavigate();
    const notify = useNotify();

    const [topNav] = useState<JSX.Element>(<TopNavigation className="" />);
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
        if (imageGuids.length == 0)
        {
            notify({
                header: "No images selected!",
                message: "You must select, and upload at least one image before submitting the listing.",
                type: "warning"
            })
            return;
        }
            

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
        <div className="h-screen min-h-screen overflow-x-hidden">
            {topNav}
            <div className='flex p-4 pt-16 text-center h-full flex-warp flex-col'>
                <h1 className="font-bold text-5xl mt-4">Create a listing</h1>
                <div className="basis-full flex flex-col md:flex-row">
                    <ImageUpload className="basis-1/3" setImageGuids={setImageGuids}/>
                    <div className="basis-2/3 mt-4 text-start px-4">
                        <h1 className="font-bold text-4xl mb-4">Details</h1>
                        <form className="flex flex-wrap justify-center gap-8" onSubmit={onListingSubmit}>
                            <input type="text" onChange={onInputChange} required name="title" className="textinput-standard" placeholder="Title"></input>
                            <input type="text" onChange={onInputChange} required name="description" className="textinput-standard" placeholder="Description"></input>
                            <input type="text" onChange={onInputChange} required name="price" className="textinput-standard" placeholder="Price"></input>
                            <input type="text" onChange={onInputChange} required name="currency" className="textinput-standard" placeholder="Currency"></input>
                            <Button className="px-4 py-2" variant="filled" type="submit">Submit</Button>
                        </form>
                    </div>    
                </div>
            </div>
        </div>
    )
}

function ImageUpload( { setImageGuids, className = "" } : { setImageGuids: React.Dispatch<React.SetStateAction<string[]>>, className: string }) {

    const maxSizeBytes = 5 * 1024 * 1024;

    const notify = useNotify();

    const [files, setFiles] = useState<UploadFile[] | null>([]);
    const [previewElements, setPreviewElements] = useState<JSX.Element[]>([]);

    const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {

        if (!event.target.files)
            return

        const filesPass: File[] = [];

        for(let i = 0; i < event.target.files.length; i++){
            const file = event.target.files[i];

            if (!['image/png', 'image/jpeg', 'imgae/webp'].includes(file.type)) {
                notify({
                    type: 'warning',
                    header: 'Incorrect file format selected!',
                    message: 'File uploads only support .png, .jpeg, and .webp formats.'
                });
                continue;
            }
            if (file.size > maxSizeBytes) {
                notify({
                    type: 'warning',
                    header: 'File is too large!',
                    message: `The file you are trying to upload is too large (${(file.size / (1024 * 1024)).toFixed(2)}MB), maximum file size is 5MB`
                });
                continue;
            }

            filesPass.push(file);
        }

        const previewElements: JSX.Element[] = [];

        setFiles(filesPass.map((f, index) => {

            const ufile: UploadFile = {
                file: f,
                progress: 0,
                success: false,
                preview: URL.createObjectURL(f)
            }

            previewElements.push(<FilePreview key={index} uFile={ufile} index={index} setPreviewElements={setPreviewElements}/>)

            return(ufile);
        }));

        setPreviewElements(previewElements);
    };

    const uploadFiles = async () => {
        if (!files) return;

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

            return postXmlHttp<UploadResult>('Images/UploadImage', formData, onProgress, [{ key: "index", value: `${index}` }])
        });
        }
        catch(e) { console.log(e); return; }

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
        if (!files) return null;

        const prevFiles = [...files];
        prevFiles[index].progress = progress;

        return prevFiles;
    }

    return(
        <div className={"basis-full px-4 mt-4 flex flex-col " + className}>
            <div className="flex justify-between items-center h-min mb-4">
                <h1 className="inline-block font-bold text-4xl">Images</h1>
                <span>
                    <label className="mx-2 border-2 border-white px-2 py-[7.5px] rounded-lg hover:bg-white hover:text-black transition-all duration-300 ease-in-out font-bold cursor-pointer">
                        Select image
                        <input hidden multiple type="file" accept="image/*" onChange={onFileChange}></input>
                    </label>
                    <Button className="mx-2 px-2 py-1" onClick={uploadFiles} disabled={!files}>
                        Upload
                    </Button>
                </span>
            </div>
            <div className="bg-(--mid-dark) border-2 border-(--light-dark) p-2 rounded-lg grid grid-cols-1 gap-2">
                {previewElements}
            </div>
        </div>
    )
}

function FilePreview({ uFile, index, setPreviewElements }: { uFile: UploadFile, index: number, setPreviewElements: React.Dispatch<React.SetStateAction<JSX.Element[]>>}) {

    const swapFileIndex = (index1: number, index2: number) => {
        setPreviewElements((prev) => {

            if (index2 < 0 || index2 >= prev.length)
                return prev

            const prevOrder = [...prev];

            const p1: { uFile: UploadFile, index: number} = prev[index1].props;
            const p2: { uFile: UploadFile, index: number} = prev[index2].props;

            prevOrder[index1] = <FilePreview uFile={p2.uFile} index={index1} key={index1} setPreviewElements={setPreviewElements}/>
            prevOrder[index2] = <FilePreview uFile={p1.uFile} index={index2} key={index2} setPreviewElements={setPreviewElements}/>

            return prevOrder;
        })
    }

    return(
        <div className="ring-2 ring-(--light-dark) rounded-lg h-full p-4 flex flex-col justify-between shrink-0 mb-2 select-none">
            <DragElement>
                <div className="sm:hidden flex flex-wrap">
                    <h1 className="basis-full">{uFile.file.name}</h1>
                    <div className="rounded-lg overflow-clip ring-2 ring-(--light-dark) mt-2 mb-4 basis-full aspect-video flex justify-center">
                        <img className="object-contain" src={uFile.preview}></img>
                    </div>
                    <ProgressBar progress={uFile.progress} className="basis-full"/>
                </div>
                <div className="hidden sm:flex flex-row">
                    <div className="flex flex-col w-16 shrink-0 justify-center pr-4 select-none">
                        <Button className="px-2 py-1" onClick={() => swapFileIndex(index, index - 1)}>🡑</Button>
                        <div className="flex items-center justify-center my-2 relative">
                            <p className="font-bold text-2xl">{index + 1}</p>
                        </div>
                        <Button className="px-2 py-1" onClick={() => swapFileIndex(index, index + 1)}>🡓</Button>
                    </div>
                    <div className="flex flex-wrap basis-full">
                        <div className="basis-full flex mb-2">
                            <div className="rounded-lg overflow-clip ring-2 ring-(--light-dark) my-2 w-2/3 aspect-video grow-0 flex justify-center items-center">
                                <img className="object-contain h-full pointer-events-none" src={uFile.preview}></img>
                            </div>
                            <h1 className="font-bold basis-1/3 shrink-0 text-2xl mt-2">{uFile.file.name}</h1>
                        </div>
                        <ProgressBar progress={uFile.progress} className="basis-full"/>
                    </div>
                    
                </div>
            </DragElement>
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