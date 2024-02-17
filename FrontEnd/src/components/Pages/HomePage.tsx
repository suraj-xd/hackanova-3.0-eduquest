import { BiGhost } from "react-icons/bi";
import { GoHome } from "react-icons/go";
import { IoDocumentTextOutline, IoTrophyOutline } from "react-icons/io5";
import { useEffect, useRef, useState } from 'react';
import Image from "next/image";
import { CiImageOn } from "react-icons/ci";
import usePromptStore from "~/store/usePromptStore";
import useLoadingStore from "~/store/useLoadingStore";
import axios from "axios";
import ReactJson from 'react-json-view'
import toast from "react-hot-toast";
import { v4 as uuidv4 } from 'uuid';
import useJsonDataStore from "~/store/useJsonDataStore";
import Link from "next/link";
import SuccessRateMeter from "../SuccessRateMeter";
import { LuDice6 } from "react-icons/lu";
import { useActiveTabStore } from "~/store/useActivetabStore";
import Loader from "../Loader";
export default function HomePage() {

    const { activeTab, setActiveTab } = useActiveTabStore();

    const { isLoading } = useLoadingStore();

    const { jsonData } = useJsonDataStore();


    return (
        <>
            <div className="w-screen mx-auto min-h-screen bg-[#13151A] flex justify-start items-center text-white">
                {/* Sidebar */}
                <div className="w-[20%] h-[100vh] bg-[#13151A] s">
                    <div className="flex flex-col items-center justify-center space-y-4 mt-5 mx-4">
                        <button
                            onClick={() => setActiveTab('Home')}
                            className={`${activeTab === 'Home' ? 'bg-[#383942] text-white' : 'text-[#9A9A9C]'} flex items-center justify-start w-full mx-auto space-x-2 px-4 py-2 rounded-md hover:bg-[#383942] hover:text-white`}>
                            <GoHome />
                            <span>Home</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('Arcade')}
                            className={`${activeTab === 'Arcade' ? 'bg-[#383942] text-white' : 'text-[#9A9A9C]'} flex items-center justify-start w-full mx-auto space-x-2 px-4 py-2 rounded-md hover:bg-[#383942] hover:text-white`}>
                            <BiGhost />
                            <span>Arcade</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('Achievements')}
                            className={`${activeTab === 'Achievements' ? 'bg-[#383942] text-white' : 'text-[#9A9A9C]'} flex items-center justify-start w-full mx-auto space-x-2 px-4 py-2 rounded-md hover:bg-[#383942] hover:text-white`}>
                            <IoTrophyOutline />
                            <span>Achievements</span>
                        </button>
                    </div>
                </div>
                {/* Right Side */}
                {activeTab == "Home" && <div className="relative w-[78%] h-[100vh] overflow-scroll bg-[#202329] m-3 mb-0 rounded-[10px]">

                    {/* Icon */}
                    <div className="z-10 w-full sticky top-0 left-0 py-10 my-10 flex justify-center bg-[#202329] items-center flex-col gap-5">
                        <Image
                            width={100}
                            height={100}
                            alt="Chatbot"
                            src={"/Subtract.svg"}
                            className={`${isLoading && "animate-pulse"}`}
                        />
                        {isLoading ? <Loader /> : <h1 className="font-medium text-lg text-white">How can i help you today?</h1>}
                    </div>
                    {/* <div className="my-10 "><pre>{JSON.stringify(data, null, 2)}</pre></div> */}
                    <div className="w-full min-h-[60vh] ">

                        {jsonData && <ReactJson
                            theme={"twilight"}
                            src={jsonData} />
                        }
                    </div>
                    {/* Prompt Bar */}

                    <PromptBar />
                </div>}
                {activeTab == "Arcade" && <Arcade />}
                {activeTab == "Achievements" && <Achievements />}
            </div>
        </>
    )
}
function Achievements() {
    const score = localStorage.getItem('score');
    const storedAccuracy = localStorage.getItem('accuracyScore');
    console.log(score);

    return (
        <>
            <div className="w-[78%] grid grid-cols-2 h-[100vh] mt-10">
                <div className="w-full h-fit">
                    <h1 className="font-medium text-lg">Your achievements</h1>

                    {/* Grids */}
                    {score ?
                        <>
                            <div className="grid grid-cols-2 w-full h-fit justify-center items-center gap-5 my-10">
                                {parseInt(score, 10) >= 1 && (
                                    <div className="w-full h-full flex justify-center items-center">
                                        <Image
                                            className="w-[180px] h-[220px]"
                                            alt="Level 5 Badge"
                                            width={100}
                                            height={100}
                                            src={"/Badge1.png"}
                                        />
                                    </div>
                                )}
                                {parseInt(score, 10) >= 5 && (
                                    <div className="w-full h-full flex justify-center items-center">
                                        <Image
                                            className="w-[180px] h-[220px]"
                                            alt="Level 10 Badge"
                                            width={100}
                                            height={100}
                                            src={"/Badge2.png"}
                                        />
                                    </div>
                                )}
                                {parseInt(score, 10) >= 10 && (
                                    <div className="w-full h-full flex justify-center items-center">
                                        <Image
                                            className="w-[180px] h-[220px]"
                                            alt="Level 15 Badge"
                                            width={100}
                                            height={100}
                                            src={"/Badge3.png"}
                                        />
                                    </div>
                                )}
                            </div>
                        </>
                        : <p className="text-gray-400 mt-5">No Achievements to show</p>}
                </div>
                <div className="w-full h-fit">
                    <h1 className="font-medium text-lg mb-10">Analysis Accuracy</h1>
                    <SuccessRateMeter
                        successRate={100 - parseInt(storedAccuracy ? storedAccuracy : 0)}
                    />
                </div>
            </div>
        </>
    )
}
function Arcade() {
    const [randomQuestion, setRandomQuestion] = useState(null);

    const fetchRandomQuestion = async () => {
        try {
            const response = await axios.get('http://localhost:3001/random-question');
            setRandomQuestion(response.data);
        } catch (error) {
            console.error('Error fetching random question:', error);
        }
    };


    return (
        <>
            <div className="w-[78%] h-[100vh]">
                <div className="flex justify-start items-center mt-5 w-full bg-[#202329] py-5 rounded-[10px]">
                    <Image
                        onClick={fetchRandomQuestion}
                        className="w-[350px] h-[250px]"
                        alt="Chatbot"
                        width={100}
                        height={100}
                        src={"/RandomGame.svg"}
                    />
                    <div className="">
                        <h1 className="font-bold text-xl ml-5">Random Question</h1>
                    </div>
                </div>
            </div>
            {randomQuestion &&
                <>
                    <div className='flex my-4 gap-3 text-2xl justify-start items-center px-4'>
                        <LuDice6 />
                        <h3 className='font-bold'>
                            Question
                        </h3>
                    </div>
                    <p className='px-4'>{randomQuestion}</p>
                </>
            }
        </>
    )
}
function PromptBar() {
    const { prompt, setPrompt } = usePromptStore();
    const { jsonData } = useJsonDataStore();

    const [responseData, setResponseData] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;
        if (!file) {
            alert('Please select an image first.');
            return;
        }
        if (file.size > 1024 * 1024) { // 1MB
            toast.error('File size limit is 1MB');
            return;
        }
        // setImage(file);
        // setImageType(file.type);

        setIsLoading(true);
        const formData = new FormData();
        formData.append('image', file);
        formData.append('imageType', file.type);
        console.log("making an api call");

        try {
            const response = await axios.post('http://localhost:3001/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log("Made Request");
            console.log(response);

            if (response.status !== 200) {
                throw new Error('Network response was not ok');
            }

            setResponseData(JSON.stringify(response.data));
            console.log(response.data.text);
            setPrompt(response.data.text);
            setIsLoading(false);


        } catch (e) {
            setIsLoading(false);

            if (axios.isAxiosError(e) && e.code === 'ERR_NETWORK') {
                console.log('A network error occurred. This could be due to server unavailability or connectivity issues.');
            } else {
                console.log(e);
            }
        } finally {
        }
        setIsLoading(false);
    };
    useEffect(() => {
        const words = responseData.split(/\s+/);
        if (words.length > 30) {
            const shortened = words.slice(0, 30).join(' ') + '...';
            setResponseData(shortened);
            setPrompt(shortened);
            setIsLoading(false);
        }
    }, [responseData]);


    const inputRefImage = useRef<HTMLInputElement>(null);
    const inputRefDocument = useRef<HTMLInputElement>(null);

    const [fileContent, setFileContent] = useState('');

    const handleDocChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;
        if (!file) {
            return;
        }

        if (file.type !== "text/plain") {
            toast.error("Only txt files are allowed");
            return;
        }
        console.log("Into Scanning");

        setIsLoading(true);
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
            const result = e.target ? e.target.result : '';
            setFileContent(result.toString());

        };
        reader.readAsText(file);
        setIsLoading(false);
    };
    useEffect(() => {

        const words = fileContent.split(/\s+/);
        if (words.length > 30) {
            const shortened = words.slice(0, 30).join(' ') + '...';
            setFileContent(shortened);
            console.log("shortened:" + shortened);

            setPrompt(shortened);
        } else {
            setPrompt(fileContent)
        }

    }, [fileContent]);
    const [uniqueID, setUniqueID] = useState(null);
    const { setJsonData } = useJsonDataStore();
    const handleSubmitPrompt = async (event: React.FormEvent<HTMLFormElement>) => {
        if (!prompt) {
            toast.error('Please enter a prompt.');
            return;
        }

        console.log(prompt);
        console.log("Making request");
        setIsLoading(true);
        const uniqueId = uuidv4();
        setUniqueID(uniqueId);
        let attempts = 0;
        const maxAttempts = 3;
        let success = false;

        while (attempts < maxAttempts && !success) {
            try {
                const response = await axios.post('http://localhost:3001/getjson', { topic: prompt, uuid: uniqueId }, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                console.log("made request");

                if (response.status === 200 && response.data) {
                    const parsedData = JSON.parse(response.data.data);
                    console.log(parsedData);
                    setJsonData(parsedData);
                    // check if it's valid json data.
                    setResult(parsedData);
                    success = true;
                    setIsLoading(false);

                } else {
                    success = true; // Exit loop on API error, not retrying further
                    setIsLoading(false);

                }
            } catch (error) {
                console.error('Attempt', attempts + 1, 'Error:', error);
                attempts += 1;
                if (attempts >= maxAttempts) {
                }
            }
        }
        setIsLoading(false);
    }
    return (
        <>
            <div className="w-[70%] sticky bottom-[50px] left-[200px] mb-10 flex justify-center items-center flex-col gap-3">
                {jsonData &&
                    <div>
                        <Link href={`/interactive/${uniqueID}`}>
                            <button className="px-10 email-submit-button relative flex h-10 w-full items-center justify-center gap-2 font-semibold focus:outline-none disabled:cursor-not-allowed">
                                Interactive Mode
                            </button>
                        </Link>
                    </div>}
                <div className="w-full flex justify-center items-center gap-2">

                    {/* Image Icon */}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                        ref={inputRefImage}
                    />
                    <CiImageOn
                        onClick={() => inputRefImage.current && inputRefImage.current.click()}
                        className="bg-[#ffffff0f] backdrop-blur-md w-[40px] h-[40px] rounded-[10px] text-gray-100 p-3"
                    />
                    {/* Doc */}
                    <input
                        type="file"
                        accept=".txt"
                        onChange={handleDocChange}
                        style={{ display: 'none' }}
                        ref={inputRefDocument}
                    />
                    <IoDocumentTextOutline
                        onClick={() => inputRefDocument.current && inputRefDocument.current.click()}
                        className="bg-[#ffffff0f] backdrop-blur-md w-[40px] h-[40px] rounded-[10px] text-gray-100 p-3 pl-3"
                    />
                    {/* Chat */}
                    <div className="bg-[#ffffff0f] flex justify-center items-center backdrop-blur-md relative w-[500px] h-[40px] rounded-[10px]">
                        {isLoading ? <Loader /> :
                            <input
                                value={prompt}
                                placeholder="what you wanna generate questions for?"
                                onChange={(e) => setPrompt(e.target.value)}
                                className="w-full h-full text-sm text-gray-300 bg-transparent border-none outline-none p-[4px] placeholder:text-sm"
                            />}
                        <Image
                            onClick={handleSubmitPrompt}
                            className="absolute right-0 bottom-0"
                            width={35}
                            height={35}
                            alt="Chatbot"
                            src={"/SubmitButton.svg"}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}