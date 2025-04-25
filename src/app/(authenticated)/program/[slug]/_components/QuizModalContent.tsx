'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle } from 'lucide-react';
import { TContent } from '@/types';
import {
    useGetQuizForLessonQuery,
    useSubmitQuizForLessonQuery,
} from '@/redux/api/course/courseApi';
import { useAppSelector } from '@/redux/hooks';
import { useSelector } from 'react-redux';

// Types based on your API structure
interface Option {
    option: string;
    isAnswered?: boolean;
    isCorrect?: boolean;
}

interface Question {
    question: string;
    options: Option[];
}

interface Interview {
    _id: string;
    interview: {
        _id: string;
    };
    questions: Question[];
}

interface AnswerPayload {
    answers: {
        question: string;
        options: Option[];
    }[];
    source: string;
    course: string;
}

interface QuizResult {
    success: boolean;
    result: {
        _id: string;
        answers: {
            question: string;
            options: Option[];
        }[];
        // Other fields...
    };
}

export const QuizModalContent = ({ lesson }: { lesson: TContent }) => {
    const { data, isLoading } = useGetQuizForLessonQuery<{
        data: Interview;
        isLoading: boolean;
    }>({
        lessonId: lesson?._id,
        lessonUrl: (lesson?.lesson as any)?.url,
    });

    const { enrollment } = useAppSelector((state) => state?.auth);
    const enrollmentData: any = enrollment;
    const coursesId = enrollmentData?.program?._id;

    console.log({ coursesId });
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<
        Record<number, number>
    >({});
    const [submittedAns, setSubmittedResult] = useState<AnswerPayload | null>(
        null,
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [quizCompleted, setQuizCompleted] = useState(false);

    const { data: result } = useSubmitQuizForLessonQuery<{ data: QuizResult }>(
        {
            interviewId: data?.interview._id,
            payload: submittedAns,
        },
        { skip: !submittedAns },
    );

    // If data is not loaded yet
    if (!data || !data.questions) {
        return (
            <div className='flex flex-col items-center justify-center min-h-[300px]'>
                <div className='h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent'></div>
                <p className='mt-4 text-muted-foreground'>
                    Loading quiz questions...
                </p>
            </div>
        );
    }

    const questions = data.questions;
    const currentQuestion = questions[currentQuestionIndex];
    const totalQuestions = questions.length;
    const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

    const handleSelectAnswer = (optionIndex: number) => {
        if (quizCompleted) {
            return;
        }

        setSelectedAnswers({
            ...selectedAnswers,
            [currentQuestionIndex]: optionIndex,
        });
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleSubmitQuiz = () => {
        setIsSubmitting(true);

        // Prepare the payload based on selected answers
        const answers = questions.map((question, qIndex) => {
            return {
                question: question.question,
                options: question.options.map((option, oIndex) => ({
                    option: option.option,
                    isAnswered: selectedAnswers[qIndex] === oIndex,
                })),
            };
        });

        const payload = {
            answers,
            source: lesson._id,
            course: coursesId, // This should be dynamic in your implementation
        };

        setSubmittedResult(payload);
        setQuizCompleted(true);
        setIsSubmitting(false);
    };

    const calculateScore = () => {
        if (!result || !result.result || !result.result.answers) {
            return { correct: 0, total: 0 };
        }

        const correctAnswers = result.result.answers.filter((answer) => {
            const selectedOption = answer.options.find((opt) => opt.isAnswered);
            return selectedOption?.isCorrect;
        }).length;

        return {
            correct: correctAnswers,
            total: result.result.answers.length,
            percentage: Math.round(
                (correctAnswers / result.result.answers.length) * 100,
            ),
        };
    };

    const renderQuizContent = () => {
        if (quizCompleted && result) {
            const score = calculateScore();

            return (
                <div className='space-y-6'>
                    <div className='text-center'>
                        <h3 className='text-2xl font-bold'>Quiz Results</h3>
                        <p className='text-muted-foreground'>
                            You scored {score.correct} out of {score.total} (
                            {score.percentage}%)
                        </p>
                        <div className='mt-4'>
                            <Progress
                                value={score.percentage}
                                className='h-3 bg-primary-foreground'
                            />
                        </div>
                    </div>

                    <div className='space-y-4 mt-8'>
                        {result.result.answers.map((answer, index) => {
                            const correctOption = answer.options.find(
                                (opt) => opt.isCorrect,
                            );
                            const selectedOption = answer.options.find(
                                (opt) => opt.isAnswered,
                            );
                            const isCorrect = selectedOption?.isCorrect;

                            return (
                                <Card
                                    key={index}
                                    className={`border-l-4 ${isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}
                                >
                                    <CardHeader className='pb-2'>
                                        <CardTitle className='text-base font-medium flex items-start gap-2'>
                                            {isCorrect ? (
                                                <CheckCircle className='h-5 w-5 text-green-500 shrink-0 mt-0.5' />
                                            ) : (
                                                <XCircle className='h-5 w-5 text-red-500 shrink-0 mt-0.5' />
                                            )}
                                            <span>{answer.question}</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className='grid gap-2'>
                                            {answer.options.map(
                                                (option, optIndex) => (
                                                    <div
                                                        key={optIndex}
                                                        className={`p-3 rounded-md flex items-center ${
                                                            option.isCorrect
                                                                ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                                                                : option.isAnswered &&
                                                                    !option.isCorrect
                                                                  ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                                                                  : 'bg-muted/40'
                                                        }`}
                                                    >
                                                        {option.option}
                                                        {option.isCorrect && (
                                                            <CheckCircle className='ml-auto h-4 w-4 text-green-500' />
                                                        )}
                                                        {option.isAnswered &&
                                                            !option.isCorrect && (
                                                                <XCircle className='ml-auto h-4 w-4 text-red-500' />
                                                            )}
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            );
        }

        return (
            <>
                <div className='mb-6'>
                    <div className='flex justify-between text-sm mb-1'>
                        <span>
                            Question {currentQuestionIndex + 1} of{' '}
                            {totalQuestions}
                        </span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className='h-2 bg-black' />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{currentQuestion.question}</CardTitle>
                        <CardDescription>
                            Select the best answer
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className='grid gap-3'>
                            {currentQuestion.options.map((option, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleSelectAnswer(index)}
                                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                        selectedAnswers[
                                            currentQuestionIndex
                                        ] === index
                                            ? 'border-primary bg-primary/5'
                                            : 'border-muted hover:border-muted-foreground/20'
                                    }`}
                                >
                                    <div className='flex items-center gap-3'>
                                        <div
                                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                                                selectedAnswers[
                                                    currentQuestionIndex
                                                ] === index
                                                    ? 'border-primary bg-primary text-primary-foreground'
                                                    : 'border-muted-foreground/50 text-transparent'
                                            }`}
                                        >
                                            {selectedAnswers[
                                                currentQuestionIndex
                                            ] === index && (
                                                <span className='h-2 w-2 rounded-full bg-current' />
                                            )}
                                        </div>
                                        <span className='text-base'>
                                            {option.option}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                    <CardFooter className='flex justify-between'>
                        <Button
                            variant='outline'
                            onClick={handlePreviousQuestion}
                            disabled={currentQuestionIndex === 0}
                        >
                            Previous
                        </Button>

                        {currentQuestionIndex < totalQuestions - 1 ? (
                            <Button
                                onClick={handleNextQuestion}
                                disabled={
                                    selectedAnswers[currentQuestionIndex] ===
                                    undefined
                                }
                            >
                                Next
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmitQuiz}
                                disabled={
                                    Object.keys(selectedAnswers).length <
                                        totalQuestions || isSubmitting
                                }
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </>
        );
    };

    return (
        <div className='w-full max-w-3xl mx-auto py-4'>
            {renderQuizContent()}
        </div>
    );
};

export default QuizModalContent;
