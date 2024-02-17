import React, { useEffect, useState } from 'react';
import axios from 'axios';
import useQuestionsData from '../../store/useQuestionsData';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import { IoIosOptions } from 'react-icons/io';
import { IoColorFillOutline } from 'react-icons/io5';
import { SiTruenas } from 'react-icons/si';
import { TiDocumentText } from 'react-icons/ti';
import { MdOutlineFeedback } from 'react-icons/md';
import Markdown from 'react-markdown'

import Loader from '~/components/Loader';


export default function index() {
    const [data, setData] = useState(null);
    const router = useRouter();
    console.log(router);

    useEffect(() => {
        const fetchData = async () => {
            const uuid = router.query.uuid;
            console.log(uuid);

            if (uuid == null || uuid == '') {
                // toast.error("No UUID Passed!");
                return;
            }
            try {
                const response = await axios.get('http://localhost:3001/interactive', {
                    params: {
                        query: uuid ?? 'default-uuid'
                    }
                });

                console.log("Requesting JSON");
                if (response.status === 500) {
                    toast.error("Server Error: 500");
                } else {
                    setData(response.data);
                }
            } catch (error) {
                console.error('Error fetching data: ', error);
            }
        };

        fetchData();
    }, [router]);
    const [allQuestions, setAllQuestions] = useState(null);
    useEffect(() => {
        const parseResponseData = (data) => {
            console.log("Data in JSON Parse");
            console.log(data);
            const parsedData = data;
            const quizTypes = ['mcq', 'fill', 'true', 'short', 'long'];
            const quizData = quizTypes.reduce((acc, type) => {
                const keys = Object.keys(parsedData).filter(key => key.toLowerCase().includes(type));
                acc[type] = keys.reduce((acc, key) => [...acc, ...parsedData[key]], []);
                return acc;
            }, {} as Record<string, any[]>);
            return quizData;
        };

        if (data) {
            const { mcq, fill, true: trueFalse, short, long } = parseResponseData(data);
            const { setMcqData, setFillData, setTrueFalseData, setShortData, setLongData } = useQuestionsData.getState();
            setAllQuestions([...mcq, ...fill, ...trueFalse, ...short, ...long])
            setMcqData(mcq);
            setFillData(fill);
            setTrueFalseData(trueFalse);
            setShortData(short);
            setLongData(long);
        }
    }, [data,setData]);
    console.log(allQuestions);
    
    const [analyedData, setAnalyzedData] = useState(null);
    const [score, setScore] = useState(null);
    const { mcqData, fillData, trueFalseData, shortData, longData, setShortData, setLongData } = useQuestionsData();
    console.log(fillData);
    useEffect(() => {
        setAnalyzedData(`Short Data: ${JSON.stringify(shortData)}, Long Data: ${JSON.stringify(longData)}`);
        console.log(`Short Data: ${JSON.stringify(shortData)}, Long Data: ${JSON.stringify(longData)}`);
    }, [shortData, longData])

    const [numericalFeedback, setNumericalFeedback] = useState(null);
    const [textFeedback, setTextFeedback] = useState(null);

    async function handleAnalyze() {
        //
        console.log("analyze");
        setIsLoading(true);
        try {
            const response = await axios.post('http://localhost:3001/analyze', { data: analyedData }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log(response);
            const storedScore = localStorage.getItem('score');
            const currentScore = storedScore ? parseInt(storedScore, 10) : 0;
            localStorage.setItem('score', (currentScore + 1).toString());
            const firstNumericalValue = response.data.data.match(/\d+/);
            setTextFeedback(response.data.data);
            if (firstNumericalValue) {
                console.log(firstNumericalValue[0]);
                setNumericalFeedback(firstNumericalValue[0] ? firstNumericalValue[0] : "No Response")
            } 
        } catch (error) {
            console.error('Error during analysis:', error);
        }
        setIsLoading(false);
    }
    const [totalScore, setTotalScore] = useState(0);
    const [isLoading, setIsLoading ] = useState(false);
    useEffect(() => {
        if (numericalFeedback) {
            const accuracyScore = parseInt(numericalFeedback, 10);
            const storedAccuracy = localStorage.getItem('accuracyScore');
            if (storedAccuracy) {
                const previousAccuracy = parseInt(storedAccuracy, 10);
                const combinedAccuracy = ((previousAccuracy + accuracyScore) / 2).toFixed(2);
                localStorage.setItem('accuracyScore', combinedAccuracy.toString());
            } else {
                localStorage.setItem('accuracyScore', accuracyScore.toString());
            }
        }
    }, [numericalFeedback]);
    
    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.shiftKey) {
                const index = event.key.toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0);
                if (index >= 0 && index < allQuestions.length) {
                    console.log(allQuestions[index].question);
                    const msg = new SpeechSynthesisUtterance(allQuestions[index].question);
                    window.speechSynthesis.speak(msg);
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);

        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [allQuestions]);
    //  Can add keyboard trigger functions.


    return (
        <>
            <main className='w-screen mx-auto min-h-screen bg-[#13151A] flex justify-start items-center text-white'>

                {data && <div className='w-full mx-[10%]'>
                    <div>
                        <div className='flex my-4 gap-3 text-2xl justify-start items-center'>
                            <IoIosOptions />
                            <h3 className='font-bold'>
                                Multiple Choice Questions</h3>
                        </div>
                        {mcqData.map((mcq, index) => (
                            <div key={index} className="mb-4">
                                <p className="my-2 font-bold text-[#9ca0d2]">{mcq.question}</p>
                                <ul className="list-inside pl-6">
                                    {mcq.options.map((option, optionIndex) => (
                                        <li key={optionIndex} className="mb-2">
                                            <label className="text-gray-200 inline-flex items-center">
                                                <input type="radio" name={`mcqOption-${index}`} value={option} className="form-radio h-5 w-5 text-gray-600" onChange={(e) => {
                                                    if (e.target.value.toLowerCase() === mcq.answer.toLowerCase()) {
                                                        setTotalScore((prevScore) => prevScore + 1);
                                                    }
                                                }} />
                                                <span className="ml-2">{option}</span>
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <div>
                        <div className='flex my-4 gap-3 text-2xl justify-start items-center'>
                            <IoColorFillOutline />
                            <h3 className='font-bold'>
                                Fill in the Blanks</h3>
                        </div>
                        {fillData.map((fib, index) => (
                            <div key={index} className='flex mb-4 last:mb-0'>
                                <p className='mr-4 flex-shrink-0'>{index + 1}.</p>
                                <div className='flex-1'>
                                    {fib.question.split(/(__+|____+|______+)/).map((segment, segmentIndex) =>
                                        segment.match(/(__+|____+|______+)/) ? (
                                            <input
                                                key={segmentIndex}
                                                type="text"
                                                className="mx-2 my-1 p-1 fill-in-blank border-b-2 border-gray-200 bg-transparent outline-none text-gray-300 text-sm"
                                            />
                                        ) : (
                                            <span key={segmentIndex} className="text-[#9ca0d2] mx-1">
                                                {segment}
                                            </span>
                                        )
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div>
                        <div className='flex my-4 gap-3 text-2xl justify-start items-center'>
                            <SiTruenas />
                            <h3 className='font-bold'>
                                Choose True or False</h3>
                        </div>
                        {trueFalseData.map((tf, index) => (
                            <div key={index} className="mb-4">
                                <p className="my-2 font-bold text-[#9ca0d2]">{index + 1}. {tf.question}</p>
                                <div className="flex items-center">
                                    <label className="inline-flex items-center mr-4">
                                        <input type="radio" name={`trueFalse-${index}`} value="True" className="form-radio h-5 w-5 text-gray-600" />
                                        <span className="ml-2 text-gray-200">True</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input type="radio" name={`trueFalse-${index}`} value="False" className="form-radio h-5 w-5 text-gray-600" />
                                        <span className="ml-2 text-gray-200">False</span>
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div>
                        <div className='flex my-4 gap-3 text-2xl justify-start items-center'>
                            <TiDocumentText />
                            <h3 className='font-bold'>
                                Short Answer
                            </h3>
                        </div>
                        {shortData.map((short, index) => (
                            <div key={index} className="mb-4">
                                <p className="mb-2 font-bold text-[#9ca0d2]">{index + 1}. {short.question}</p>
                                <textarea
                                    className='w-full  flex h-fit outline-none border-[1px] border-gray-600 text-xs bg-transparent p-2  rounded-[3px]'
                                    type="text"
                                    defaultValue={null}
                                    placeholder="Your answer here"
                                    onChange={(e) => {
                                        const updatedShortData = [...shortData];
                                        updatedShortData[index].answer = e.target.value;
                                        setShortData(updatedShortData);
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                    <div>
                        <div className='flex my-4 gap-3 text-2xl justify-start items-center'>
                            <TiDocumentText />
                            <h3 className='font-bold'>
                                Long Answer
                            </h3>
                        </div>
                        {longData.map((long, index) => (
                            <div key={index}>
                                <p className="mb-2 font-bold text-[#9ca0d2]">{index + 1}. {long.question}</p>
                                <textarea
                                    className='w-full  flex h-[100px] outline-none border-[1px] border-gray-600 text-xs bg-transparent p-2  rounded-[3px]'
                                    defaultValue={null}
                                    placeholder="Your answer here"
                                    onChange={(e) => {
                                        const updatedLongData = [...longData];
                                        updatedLongData[index].answer = e.target.value;
                                        setLongData(updatedLongData);
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                        <button 
                            onClick={handleAnalyze}
                            className="mx-auto px-10 my-10 w-[130px] email-submit-button relative flex h-10 items-center justify-center gap-2 font-semibold focus:outline-none disabled:cursor-not-allowed">
                          {isLoading ? <Loader/> : "Analyze"}
                        </button>
                    <div>
                        {/* {textFeedback ? */}
                            <>
                                <div className='flex my-4 gap-3 text-2xl justify-start items-center'>
                                    <MdOutlineFeedback />
                                    <h3 className='font-bold'>
                                        Feedback
                                    </h3>
                                </div>
                                <div className='mb-10'>
                                <Markdown>{textFeedback}</Markdown>
                                </div>
                            </>
                            {/* : numericalFeedback ?
                                <div className='flex my-4 gap-3 text-2xl justify-start items-center'>
                                    <MdOutlineFeedback />
                                    <h3 className='font-bold'>
                                        Score: {numericalFeedback}
                                    </h3>
                                </div>
                                : <></>
                        } */}

                    </div>
                </div>}


            </main>

        </>
    );
}
