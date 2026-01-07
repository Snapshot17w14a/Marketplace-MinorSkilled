import { useEffect, useRef, useState, type ChangeEvent } from "react"
import { Image, X } from "lucide-react";
import { useHover } from "@uidotdev/usehooks";
import { UploadFilesToServer, ValidateFileTypeAndSize } from "../FileHandler";
import { useNotify } from "../Components/NotificationProvider";
import Button from "../Components/Button";
import { postAuthorized } from "../BackendClient";
import { useNavigate } from "react-router-dom";
import currencyConfig from "../Configs/currency.config";
import CategoryLabel from "../Components/CategoryLabel";
import categoriesConfig from "../Configs/categories.config";

export default function CreateListing() {

    const [listingImages, setListingImages] = useState<File[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const isDragOver = useRef<boolean>(false);
    const selectRef = useRef<HTMLSelectElement>(null);

    const [dragZoneRef, isHovering] = useHover<HTMLDivElement>();
    const [listingData, setListingData] = useState({
        title: '',
        description: '',
        price: ''
    })

    const notify = useNotify();
    const navigate = useNavigate();

    const onInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            const { name, value } = event.target;
            setListingData(prev => ({
                ...prev,
                [name]: value,
            }));
        }

    const dropHandler = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        isDragOver.current = false;

        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            const filesArray = Array.from(event.dataTransfer.files);

            setListingImages((prevImages) => [...prevImages, ...ValidateFileTypeAndSize(filesArray, notify)]);
        }
    }

    const dragOverHandler = (event: React.DragEvent<HTMLDivElement>) => {
        if (!event.dataTransfer) return;

        const files = Array.from(event.dataTransfer.items).filter(item => item.kind === "file");

        if (files.length > 0) {
            event.dataTransfer.dropEffect = files.some((item) => item.type.startsWith("image/")) ? "copy" : "none";
            isDragOver.current = true;
        }
    };

    const onFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {

        if (!event.target.files || event.target.files.length === 0) return;
        const files = Array.from(event.target.files);

        setListingImages((prevImages) => [...prevImages, ...ValidateFileTypeAndSize(files, notify)]);
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (listingImages.length === 0)
        {
            notify({
                header: "No images selected!",
                message: "You must select, and upload at least one image before submitting the listing.",
                type: "warning"
            })
            return;
        }

        const listingImageIds = await UploadFilesToServer(listingImages);

        // Gather the category IDs based on selected category names
        const categoryIds = selectedCategories.map(catName => {
            return categoriesConfig.categoryIds.find(cat => cat.name === catName)?.id;
        });

        const listing = {
            title: listingData.title,
            description: listingData.description,
            price: +listingData.price,
            currency: selectRef.current ? selectRef.current.value : 'EUR',
            linkedImages: listingImageIds,
            categories: categoryIds
        }

        const response = await (await postAuthorized('Listings/CreateListing', listing)).json();
        
        navigate(`/listing/${response.listingId}`);
    }

    const removeImageAtIndex = (index: number) => {
        setListingImages((prevImages) => prevImages.filter((_, i) => i !== index));
    }

    // Set up event lististeners to prevent default browser behavior for drag-and-drop
    useEffect(() => {

        window.addEventListener('dragover', (e) => {
            if (e.dataTransfer && e.dataTransfer.items.length > 0)
                e.preventDefault();
        });

        window.addEventListener('drop', (e) => {
            if (e.dataTransfer && e.dataTransfer.items.length > 0)
                e.preventDefault();
        })

        return () => {
            window.removeEventListener('dragover', () => {}),
            window.removeEventListener('drop', () => {})
        };
    }, []);

    return (
        <div className="w-full mt-24">

            <div className="space-y-6 md:px-12 px-6 md:text-start text-center">
                <h1 className="text-6xl font-bold">Create Listing</h1>
                <p>Simply upload images of what you are selling, provide a description and price, and you are all set!</p>
            </div>

            <div className="w-full grid md:grid-cols-2 grid-cols-1">

                {/* Image Upload Section */}
                <div className="py-8 px-12 space-y-8">

                    <p className="font-bold">Listing images</p>
                    <div 
                        className="w-full h-32 border-2 border-dashed border-(--light-dark) rounded-lg transition-colors duration-500"
                        onDragOver={dragOverHandler}
                        onDrop={dropHandler}
                        ref={dragZoneRef}
                        style={{
                            backgroundColor: isDragOver.current || isHovering ? 'var(--mid-dark)' : 'transparent'
                        }}
                    >
                        <label className="w-full h-full flex justify-center items-center cursor-pointer">
                            <div className="flex justify-center flex-wrap">
                                <Image className="basis-full text-(--light-dark)" size={64}/>
                                <p className="text-(--light-dark) font-bold">Drag and drop images here or click to upload</p>
                            </div>
                            <input hidden type="file" id="file-input" multiple accept="image/*" className="" onChange={onFileSelect}/>
                        </label>
                    </div>

                    {/* Preview Selected Images */}
                    <div className="grid grid-cols-2 gap-4">
                        {listingImages.length > 0 && 
                        listingImages.map((file, index) => {
                            return(
                                <div className="relative text-center hover:scale-105 transition-transform hover:ring-2 ring-rose-500 group" key={index}>
                                    <img key={index} src={URL.createObjectURL(file)} alt={`Listing Image ${index + 1}`} className="aspect-video w-full" />

                                    <p className="absolute bottom-0 text-sm bg-neutral-700/70 px-2 py-1">{file.name}</p>
                                    <div 
                                        className="hidden absolute group-hover:flex top-0 w-full h-full bg-neutral-400/25 justify-center items-center"
                                        onClick={() => removeImageAtIndex(index)}
                                    >
                                        <X className='text-rose-500' size={64}/>
                                    </div>
                                </div>
                            );
                        })
                    }
                    </div>
                </div>

                {/* Listing Details Section */}
                <div className="p-8">
                    <p className="font-bold mb-8">Listing content</p>
                    <form className="space-y-6" onSubmit={handleSubmit}>

                        <input onChange={onInputChange} required className="textinput-standard" name='title' type='text' placeholder='Title'></input>

                        <div className="flex gap-4">

                            <input onChange={onInputChange} required className="textinput-standard" name='price' type='text' placeholder='Price'></input>
                            <select ref={selectRef} className="textinput-standard" onChange={onInputChange} name='currency' required>
                                {currencyConfig.currencies.map((currency) => (
                                    <option key={currency.code} value={currency.code}>
                                        {currency.name} ({currency.symbol})
                                    </option>
                                ))}
                            </select>

                        </div>

                        <textarea   onChange={onInputChange} required className="textinput-standard" name='description' placeholder="Description"></textarea>
                        
                        <p>Categories</p>
                        <div className="bg-(--mid-dark) w-full rounded-lg p-4 space-x-6 flex">
                            {categoriesConfig.categories.map((category) => {
                                return(
                                    <label className="space-x-2 flex items-center" key={category.name}>
                                        <CategoryLabel category={category}/>
                                        <input type="checkbox" name="category" value={category.name}
                                            onChange={(e) => {
                                                if (e.target.checked){
                                                    setSelectedCategories((prev) => [...prev, category.name]);
                                                } else {
                                                    setSelectedCategories((prev) => prev.filter((cat) => cat !== category.name));
                                                }
                                                console.log(selectedCategories);
                                            }}
                                        />
                                    </label>
                                )
                            })}
                        </div>

                        <Button type='submit' variant="filled" className="px-4 py-2">Submit Listing</Button>
                    </form>    
                </div>

            </div>
            
        </div>
    )
}