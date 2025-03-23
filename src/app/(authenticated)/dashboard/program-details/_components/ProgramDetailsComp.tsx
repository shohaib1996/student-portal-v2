'use client';
import { useEffect, useState } from 'react';
import { ArrowLeft, Star, Users, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GlobalHeader from '@/components/global/GlobalHeader';
import { usePathname, useRouter } from 'next/navigation';
import { useMyProgramQuery } from '@/redux/api/myprogram/myprogramApi';
import {
    useCourseContentQuery,
    usePostCourseProgramsMutation,
} from '@/redux/api/course/courseApi';
import {
    ChapterType,
    ICourseData,
    TChaptersResponse,
    TContent,
    TProgram,
} from '@/types';
import ProgramContent from './ProgramContent';

// Types for course data
interface SubLesson {
    id: string;
    title: string;
    date: string;
    time: string;
    duration: string;
    priority: 'High' | 'Medium' | 'Low';
    status: 'completed' | 'current' | 'upcoming';
    tags: string[];
}

interface Lesson {
    id: string;
    title: string;
    date: string;
    time: string;
    duration: string;
    priority: 'High' | 'Medium' | 'Low';
    status: 'completed' | 'current' | 'upcoming';
    tags: string[];
    isNew?: boolean;
    hasContent?: boolean;
    isFolder?: boolean;
    subLessons?: SubLesson[];
}

interface Module {
    id: string;
    title: string;
    lectures: number;
    duration: string;
    progress: number;
    lessons: Lesson[];
    isExpanded?: boolean;
    date?: string;
    time?: string;
}

export default function ProgramDetailsComp({ slug }: { slug: string }) {
    const pathname = usePathname();
    const router = useRouter();

    // Fetch program and course data
    const { data: myPrograms, isLoading: isProgramsLoading } =
        useMyProgramQuery({});
    const { data: courseContent, isLoading: isCourseContentLoading } =
        useCourseContentQuery({ slug });
    const [getPrograms, { isLoading: courseProgramsLoading }] =
        usePostCourseProgramsMutation();

    // Extract relevant data
    const program: TProgram | undefined = myPrograms?.program;
    const courseContentData: ICourseData | undefined = courseContent;

    const tabs = courseContentData?.category?.categories;
    const [parentId, setParentId] = useState<string | null>(null);
    // State for selected tab and data
    const [selectedTab, setSelectedTab] = useState({
        tab: 'Modules',
        value: 'modules',
    });
    const [filterOption, setFilterOption] = useState<{
        filter: string;
        query: string;
    }>({
        filter: '',
        query: '',
    });

    const [fetchedData, setFetchedData] = useState<TContent[] | null>(null);
    const fetchProgramData = async (
        parent: string | null,
        filterBy: string,
        queryText: string,
    ) => {
        try {
            const res = (await getPrograms({
                body: {
                    filterBy: filterBy,
                    parent: parent,
                    queryText: queryText,
                },
                contentId: selectedTab?.value,
                slug: slug,
            }).unwrap()) as TChaptersResponse;

            if (parent) {
                setFetchedData((prev) => {
                    if (!prev) {
                        return res.chapters;
                    } // Initial data load
                    return mergeChapters(prev, parent, res.chapters);
                });
            } else {
                setFetchedData(res.chapters);
            }
        } catch (error) {
            console.error('Error fetching program data:', error);
        }
    };

    const mergeChapters = (
        chapters: TContent[],
        parentId: string | null,
        newChapters: TContent[],
    ): TContent[] => {
        return chapters.map((chapter) => {
            if (
                chapter._id === parentId &&
                chapter.type === ChapterType.CHAPTER
            ) {
                // Merge only unique chapters
                const existingIds = new Set(
                    chapter.chapter.children?.map((child) => child._id) || [],
                );
                const uniqueChapters = newChapters.filter(
                    (newChapter) => !existingIds.has(newChapter._id),
                );

                return {
                    ...chapter,
                    chapter: {
                        ...chapter.chapter,
                        children: chapter.chapter.children
                            ? [...chapter.chapter.children, ...uniqueChapters]
                            : uniqueChapters,
                    },
                };
            }
            if (
                chapter.type === ChapterType.CHAPTER &&
                chapter.chapter.children
            ) {
                return {
                    ...chapter,
                    chapter: {
                        ...chapter.chapter,
                        children: mergeChapters(
                            chapter.chapter.children,
                            parentId,
                            newChapters,
                        ),
                    },
                };
            }
            return chapter;
        });
    };

    useEffect(() => {
        // setSelectedTab({tab:})
        if (tabs && tabs?.length > 0 && selectedTab.value === 'modules') {
            setSelectedTab({ tab: tabs[0].name, value: tabs[0]._id });
        }

        if (tabs && tabs?.length > 0 && selectedTab?.value !== 'modules') {
            fetchProgramData(
                parentId,
                filterOption?.filter,
                filterOption?.query,
            );
        }
    }, [parentId, tabs, selectedTab.value, slug, parentId, filterOption]);

    return (
        <div className='bg-background border-t border-border pt-2'>
            <GlobalHeader
                title={
                    <span className='flex items-center justify-center gap-1'>
                        <ArrowLeft
                            onClick={() => router.push('/dashboard/program')}
                            size={18}
                            className='cursor-pointer'
                        />
                        {program?.title}
                    </span>
                }
                tooltip={program?.title}
                buttons={
                    <div className='flex items-center gap-3 mb-2'>
                        <Button variant='primary_light' className=''>
                            <span>
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    width='20'
                                    height='20'
                                    viewBox='0 0 20 20'
                                    fill='none'
                                >
                                    <g clipPath='url(#clip0_336_46691)'>
                                        <path
                                            d='M12.5186 8.80273C12.5186 8.49211 12.2667 8.24023 11.9561 8.24023H5.76855C5.45793 8.24023 5.20605 8.49211 5.20605 8.80273C5.20605 9.11336 5.45793 9.36523 5.76855 9.36523H11.9561C12.2667 9.36523 12.5186 9.11336 12.5186 8.80273Z'
                                            fill='#0736D1'
                                        />
                                        <path
                                            d='M12.5186 8.80273C12.5186 8.49211 12.2667 8.24023 11.9561 8.24023H5.76855C5.45793 8.24023 5.20605 8.49211 5.20605 8.80273C5.20605 9.11336 5.45793 9.36523 5.76855 9.36523H11.9561C12.2667 9.36523 12.5186 9.11336 12.5186 8.80273Z'
                                            fill='black'
                                            fillOpacity='0.2'
                                        />
                                        <path
                                            d='M12.5186 8.80273C12.5186 8.49211 12.2667 8.24023 11.9561 8.24023H5.76855C5.45793 8.24023 5.20605 8.49211 5.20605 8.80273C5.20605 9.11336 5.45793 9.36523 5.76855 9.36523H11.9561C12.2667 9.36523 12.5186 9.11336 12.5186 8.80273Z'
                                            stroke='#0736D1'
                                            strokeWidth='0.5'
                                        />
                                        <path
                                            d='M12.5186 8.80273C12.5186 8.49211 12.2667 8.24023 11.9561 8.24023H5.76855C5.45793 8.24023 5.20605 8.49211 5.20605 8.80273C5.20605 9.11336 5.45793 9.36523 5.76855 9.36523H11.9561C12.2667 9.36523 12.5186 9.11336 12.5186 8.80273Z'
                                            stroke='black'
                                            strokeOpacity='0.2'
                                            strokeWidth='0.5'
                                        />
                                        <path
                                            d='M5.76758 11.082C5.45695 11.082 5.20508 11.3339 5.20508 11.6445C5.20508 11.9552 5.45695 12.207 5.76758 12.207H9.0482C9.35883 12.207 9.6107 11.9552 9.6107 11.6445C9.6107 11.3339 9.35883 11.082 9.0482 11.082H5.76758Z'
                                            fill='#0736D1'
                                        />
                                        <path
                                            d='M5.76758 11.082C5.45695 11.082 5.20508 11.3339 5.20508 11.6445C5.20508 11.9552 5.45695 12.207 5.76758 12.207H9.0482C9.35883 12.207 9.6107 11.9552 9.6107 11.6445C9.6107 11.3339 9.35883 11.082 9.0482 11.082H5.76758Z'
                                            fill='black'
                                            fillOpacity='0.2'
                                        />
                                        <path
                                            d='M5.76758 11.082C5.45695 11.082 5.20508 11.3339 5.20508 11.6445C5.20508 11.9552 5.45695 12.207 5.76758 12.207H9.0482C9.35883 12.207 9.6107 11.9552 9.6107 11.6445C9.6107 11.3339 9.35883 11.082 9.0482 11.082H5.76758Z'
                                            stroke='#0736D1'
                                            strokeWidth='0.5'
                                        />
                                        <path
                                            d='M5.76758 11.082C5.45695 11.082 5.20508 11.3339 5.20508 11.6445C5.20508 11.9552 5.45695 12.207 5.76758 12.207H9.0482C9.35883 12.207 9.6107 11.9552 9.6107 11.6445C9.6107 11.3339 9.35883 11.082 9.0482 11.082H5.76758Z'
                                            stroke='black'
                                            strokeOpacity='0.2'
                                            strokeWidth='0.5'
                                        />
                                        <path
                                            d='M16.225 8.83531C15.9144 8.83531 15.6625 9.08719 15.6625 9.39781V13.9472C15.6625 14.7984 14.97 15.4909 14.1188 15.4909H10.3563C10.2344 15.4909 10.1156 15.5303 10.0181 15.6041L6.76938 18.0472C6.68688 18.1091 6.60938 18.0834 6.57062 18.0622C6.53125 18.0422 6.46625 17.9928 6.46875 17.8922L6.53125 16.0734C6.53625 15.9209 6.47938 15.7728 6.37375 15.6634C6.26813 15.5534 6.12188 15.4916 5.96938 15.4916H3.35625C2.505 15.4916 1.8125 14.7997 1.8125 13.9478V6.51031C1.8125 5.65594 2.505 4.96094 3.35625 4.96094H10.2875C10.5981 4.96094 10.85 4.70906 10.85 4.39844C10.85 4.08781 10.5981 3.83594 10.2875 3.83594H3.35625C1.885 3.83594 0.6875 5.03594 0.6875 6.51094V13.9478C0.6875 15.4191 1.885 16.6172 3.35625 16.6172H5.38688L5.34438 17.8559C5.32938 18.3647 5.6 18.8272 6.05188 19.0616C6.245 19.1622 6.45312 19.2116 6.65938 19.2116C6.93625 19.2116 7.21063 19.1222 7.44438 18.9478L10.5438 16.6172H14.1181C15.5894 16.6172 16.7869 15.4197 16.7869 13.9478V9.39844C16.7875 9.08719 16.5356 8.83531 16.225 8.83531Z'
                                            fill='#0736D1'
                                        />
                                        <path
                                            d='M16.225 8.83531C15.9144 8.83531 15.6625 9.08719 15.6625 9.39781V13.9472C15.6625 14.7984 14.97 15.4909 14.1188 15.4909H10.3563C10.2344 15.4909 10.1156 15.5303 10.0181 15.6041L6.76938 18.0472C6.68688 18.1091 6.60938 18.0834 6.57062 18.0622C6.53125 18.0422 6.46625 17.9928 6.46875 17.8922L6.53125 16.0734C6.53625 15.9209 6.47938 15.7728 6.37375 15.6634C6.26813 15.5534 6.12188 15.4916 5.96938 15.4916H3.35625C2.505 15.4916 1.8125 14.7997 1.8125 13.9478V6.51031C1.8125 5.65594 2.505 4.96094 3.35625 4.96094H10.2875C10.5981 4.96094 10.85 4.70906 10.85 4.39844C10.85 4.08781 10.5981 3.83594 10.2875 3.83594H3.35625C1.885 3.83594 0.6875 5.03594 0.6875 6.51094V13.9478C0.6875 15.4191 1.885 16.6172 3.35625 16.6172H5.38688L5.34438 17.8559C5.32938 18.3647 5.6 18.8272 6.05188 19.0616C6.245 19.1622 6.45312 19.2116 6.65938 19.2116C6.93625 19.2116 7.21063 19.1222 7.44438 18.9478L10.5438 16.6172H14.1181C15.5894 16.6172 16.7869 15.4197 16.7869 13.9478V9.39844C16.7875 9.08719 16.5356 8.83531 16.225 8.83531Z'
                                            fill='black'
                                            fillOpacity='0.2'
                                        />
                                        <path
                                            d='M16.225 8.83531C15.9144 8.83531 15.6625 9.08719 15.6625 9.39781V13.9472C15.6625 14.7984 14.97 15.4909 14.1188 15.4909H10.3563C10.2344 15.4909 10.1156 15.5303 10.0181 15.6041L6.76938 18.0472C6.68688 18.1091 6.60938 18.0834 6.57062 18.0622C6.53125 18.0422 6.46625 17.9928 6.46875 17.8922L6.53125 16.0734C6.53625 15.9209 6.47938 15.7728 6.37375 15.6634C6.26813 15.5534 6.12188 15.4916 5.96938 15.4916H3.35625C2.505 15.4916 1.8125 14.7997 1.8125 13.9478V6.51031C1.8125 5.65594 2.505 4.96094 3.35625 4.96094H10.2875C10.5981 4.96094 10.85 4.70906 10.85 4.39844C10.85 4.08781 10.5981 3.83594 10.2875 3.83594H3.35625C1.885 3.83594 0.6875 5.03594 0.6875 6.51094V13.9478C0.6875 15.4191 1.885 16.6172 3.35625 16.6172H5.38688L5.34438 17.8559C5.32938 18.3647 5.6 18.8272 6.05188 19.0616C6.245 19.1622 6.45312 19.2116 6.65938 19.2116C6.93625 19.2116 7.21063 19.1222 7.44438 18.9478L10.5438 16.6172H14.1181C15.5894 16.6172 16.7869 15.4197 16.7869 13.9478V9.39844C16.7875 9.08719 16.5356 8.83531 16.225 8.83531Z'
                                            stroke='#0736D1'
                                            strokeWidth='0.5'
                                        />
                                        <path
                                            d='M16.225 8.83531C15.9144 8.83531 15.6625 9.08719 15.6625 9.39781V13.9472C15.6625 14.7984 14.97 15.4909 14.1188 15.4909H10.3563C10.2344 15.4909 10.1156 15.5303 10.0181 15.6041L6.76938 18.0472C6.68688 18.1091 6.60938 18.0834 6.57062 18.0622C6.53125 18.0422 6.46625 17.9928 6.46875 17.8922L6.53125 16.0734C6.53625 15.9209 6.47938 15.7728 6.37375 15.6634C6.26813 15.5534 6.12188 15.4916 5.96938 15.4916H3.35625C2.505 15.4916 1.8125 14.7997 1.8125 13.9478V6.51031C1.8125 5.65594 2.505 4.96094 3.35625 4.96094H10.2875C10.5981 4.96094 10.85 4.70906 10.85 4.39844C10.85 4.08781 10.5981 3.83594 10.2875 3.83594H3.35625C1.885 3.83594 0.6875 5.03594 0.6875 6.51094V13.9478C0.6875 15.4191 1.885 16.6172 3.35625 16.6172H5.38688L5.34438 17.8559C5.32938 18.3647 5.6 18.8272 6.05188 19.0616C6.245 19.1622 6.45312 19.2116 6.65938 19.2116C6.93625 19.2116 7.21063 19.1222 7.44438 18.9478L10.5438 16.6172H14.1181C15.5894 16.6172 16.7869 15.4197 16.7869 13.9478V9.39844C16.7875 9.08719 16.5356 8.83531 16.225 8.83531Z'
                                            stroke='black'
                                            strokeOpacity='0.2'
                                            strokeWidth='0.5'
                                        />
                                        <path
                                            d='M19.2656 3.47633C19.1637 3.16383 18.9131 2.93008 18.595 2.85133L17.1575 2.4932L16.3725 1.23695C16.0243 0.678203 15.1156 0.679453 14.7681 1.23695L13.9831 2.4932L12.5456 2.85133C12.2275 2.93008 11.9762 3.16383 11.875 3.47633C11.7737 3.78883 11.8387 4.1257 12.05 4.37758L13.0025 5.51133L12.8987 6.98883C12.8756 7.31633 13.0206 7.62695 13.2862 7.82008C13.4512 7.94008 13.645 8.00195 13.8412 8.00195C13.9606 8.00195 14.0812 7.97883 14.1968 7.93195L15.5706 7.37695L16.9437 7.93195C17.2481 8.0557 17.5881 8.0132 17.8543 7.8207C18.12 7.62758 18.265 7.31695 18.2425 6.98883L18.1387 5.51133L19.0912 4.37695C19.3018 4.1257 19.3675 3.78883 19.2656 3.47633ZM17.1306 4.96195C17.0368 5.07383 16.99 5.21758 17.0006 5.36383L17.1006 6.78258L15.7818 6.24945C15.7143 6.22195 15.6425 6.2082 15.5712 6.2082C15.5 6.2082 15.4281 6.22195 15.3606 6.24945L14.0425 6.78258L14.1418 5.36383C14.1518 5.2182 14.105 5.07383 14.0118 4.96195L13.0975 3.8732L14.4775 3.52883C14.6187 3.4932 14.7412 3.40508 14.8181 3.28133L15.5718 2.0757L16.3256 3.28133C16.4031 3.40508 16.525 3.49383 16.6662 3.52883L18.0462 3.8732L17.1306 4.96195Z'
                                            fill='#0736D1'
                                        />
                                        <path
                                            d='M19.2656 3.47633C19.1637 3.16383 18.9131 2.93008 18.595 2.85133L17.1575 2.4932L16.3725 1.23695C16.0243 0.678203 15.1156 0.679453 14.7681 1.23695L13.9831 2.4932L12.5456 2.85133C12.2275 2.93008 11.9762 3.16383 11.875 3.47633C11.7737 3.78883 11.8387 4.1257 12.05 4.37758L13.0025 5.51133L12.8987 6.98883C12.8756 7.31633 13.0206 7.62695 13.2862 7.82008C13.4512 7.94008 13.645 8.00195 13.8412 8.00195C13.9606 8.00195 14.0812 7.97883 14.1968 7.93195L15.5706 7.37695L16.9437 7.93195C17.2481 8.0557 17.5881 8.0132 17.8543 7.8207C18.12 7.62758 18.265 7.31695 18.2425 6.98883L18.1387 5.51133L19.0912 4.37695C19.3018 4.1257 19.3675 3.78883 19.2656 3.47633ZM17.1306 4.96195C17.0368 5.07383 16.99 5.21758 17.0006 5.36383L17.1006 6.78258L15.7818 6.24945C15.7143 6.22195 15.6425 6.2082 15.5712 6.2082C15.5 6.2082 15.4281 6.22195 15.3606 6.24945L14.0425 6.78258L14.1418 5.36383C14.1518 5.2182 14.105 5.07383 14.0118 4.96195L13.0975 3.8732L14.4775 3.52883C14.6187 3.4932 14.7412 3.40508 14.8181 3.28133L15.5718 2.0757L16.3256 3.28133C16.4031 3.40508 16.525 3.49383 16.6662 3.52883L18.0462 3.8732L17.1306 4.96195Z'
                                            fill='black'
                                            fillOpacity='0.2'
                                        />
                                        <path
                                            d='M19.2656 3.47633C19.1637 3.16383 18.9131 2.93008 18.595 2.85133L17.1575 2.4932L16.3725 1.23695C16.0243 0.678203 15.1156 0.679453 14.7681 1.23695L13.9831 2.4932L12.5456 2.85133C12.2275 2.93008 11.9762 3.16383 11.875 3.47633C11.7737 3.78883 11.8387 4.1257 12.05 4.37758L13.0025 5.51133L12.8987 6.98883C12.8756 7.31633 13.0206 7.62695 13.2862 7.82008C13.4512 7.94008 13.645 8.00195 13.8412 8.00195C13.9606 8.00195 14.0812 7.97883 14.1968 7.93195L15.5706 7.37695L16.9437 7.93195C17.2481 8.0557 17.5881 8.0132 17.8543 7.8207C18.12 7.62758 18.265 7.31695 18.2425 6.98883L18.1387 5.51133L19.0912 4.37695C19.3018 4.1257 19.3675 3.78883 19.2656 3.47633ZM17.1306 4.96195C17.0368 5.07383 16.99 5.21758 17.0006 5.36383L17.1006 6.78258L15.7818 6.24945C15.7143 6.22195 15.6425 6.2082 15.5712 6.2082C15.5 6.2082 15.4281 6.22195 15.3606 6.24945L14.0425 6.78258L14.1418 5.36383C14.1518 5.2182 14.105 5.07383 14.0118 4.96195L13.0975 3.8732L14.4775 3.52883C14.6187 3.4932 14.7412 3.40508 14.8181 3.28133L15.5718 2.0757L16.3256 3.28133C16.4031 3.40508 16.525 3.49383 16.6662 3.52883L18.0462 3.8732L17.1306 4.96195Z'
                                            stroke='#0736D1'
                                            strokeWidth='0.5'
                                        />
                                        <path
                                            d='M19.2656 3.47633C19.1637 3.16383 18.9131 2.93008 18.595 2.85133L17.1575 2.4932L16.3725 1.23695C16.0243 0.678203 15.1156 0.679453 14.7681 1.23695L13.9831 2.4932L12.5456 2.85133C12.2275 2.93008 11.9762 3.16383 11.875 3.47633C11.7737 3.78883 11.8387 4.1257 12.05 4.37758L13.0025 5.51133L12.8987 6.98883C12.8756 7.31633 13.0206 7.62695 13.2862 7.82008C13.4512 7.94008 13.645 8.00195 13.8412 8.00195C13.9606 8.00195 14.0812 7.97883 14.1968 7.93195L15.5706 7.37695L16.9437 7.93195C17.2481 8.0557 17.5881 8.0132 17.8543 7.8207C18.12 7.62758 18.265 7.31695 18.2425 6.98883L18.1387 5.51133L19.0912 4.37695C19.3018 4.1257 19.3675 3.78883 19.2656 3.47633ZM17.1306 4.96195C17.0368 5.07383 16.99 5.21758 17.0006 5.36383L17.1006 6.78258L15.7818 6.24945C15.7143 6.22195 15.6425 6.2082 15.5712 6.2082C15.5 6.2082 15.4281 6.22195 15.3606 6.24945L14.0425 6.78258L14.1418 5.36383C14.1518 5.2182 14.105 5.07383 14.0118 4.96195L13.0975 3.8732L14.4775 3.52883C14.6187 3.4932 14.7412 3.40508 14.8181 3.28133L15.5718 2.0757L16.3256 3.28133C16.4031 3.40508 16.525 3.49383 16.6662 3.52883L18.0462 3.8732L17.1306 4.96195Z'
                                            stroke='black'
                                            strokeOpacity='0.2'
                                            strokeWidth='0.5'
                                        />
                                    </g>
                                    <defs>
                                        <clipPath id='clip0_336_46691'>
                                            <rect
                                                width='20'
                                                height='20'
                                                fill='white'
                                            />
                                        </clipPath>
                                    </defs>
                                </svg>
                            </span>
                            Leave a Review
                        </Button>
                        <Button className=''>
                            <span>
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    width='16'
                                    height='16'
                                    viewBox='0 0 16 16'
                                    fill='none'
                                >
                                    <path
                                        d='M10.667 2L13.3337 4.66667L10.667 7.33333'
                                        stroke='white'
                                        strokeWidth='1.5'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                    />
                                    <path
                                        d='M13.3337 4.66602H2.66699'
                                        stroke='white'
                                        strokeWidth='1.5'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                    />
                                    <path
                                        d='M5.33366 13.9993L2.66699 11.3327L5.33366 8.66602'
                                        stroke='white'
                                        strokeWidth='1.5'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                    />
                                    <path
                                        d='M2.66699 11.334H13.3337'
                                        stroke='white'
                                        strokeWidth='1.5'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                    />
                                </svg>
                            </span>
                            Switch Program
                        </Button>
                    </div>
                }
            />
            <Tabs
                value={selectedTab.value}
                onValueChange={(value) => {
                    const tab = tabs?.find((t) => t._id === value);
                    setSelectedTab({
                        tab: tab?.name as string,
                        value: tab?._id as string,
                    });
                    setParentId(null);
                }}
                className='w-full'
            >
                {/* Tabs Navigation */}
                <div className='border-b border-border'>
                    <div className='flex justify-between items-center py-2'>
                        <TabsList className='bg-foreground p-1 rounded-full gap-2'>
                            {tabs?.map((tab, i) => (
                                <TabsTrigger
                                    key={tab?._id || i}
                                    value={tab?._id || ''}
                                    className='rounded-full data-[state=active]:bg-primary data-[state=active]:text-white text-sm font-medium'
                                >
                                    {tab?.name || 'Untitled'}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        <div className='flex items-center gap-4'>
                            <div className='flex items-center gap-1 text-nowrap'>
                                <div className='flex'>
                                    {Array.from(
                                        {
                                            length: Math.floor(4.9),
                                        },
                                        (_, i) => (
                                            <Star
                                                key={i}
                                                className='h-4 w-4 fill-yellow-400 text-yellow-400'
                                            />
                                        ),
                                    )}
                                </div>
                                <span className='text-sm font-medium'>4.9</span>
                                <span className='text-xs text-gray'>
                                    (128 reviews)
                                </span>
                            </div>
                            <div className='flex items-center gap-1 text-nowrap'>
                                <Users className='h-4 w-4 text-primary' />
                                <span className='text-sm font-medium'>
                                    345 students
                                </span>
                            </div>
                            <div className='flex items-center gap-1 text-nowrap'>
                                <Clock className='h-4 w-4 text-gray' />
                                <span className='text-sm'>
                                    Last updated 2 week ago
                                </span>
                            </div>
                            <div className='flex items-center gap-1 text-nowrap'>
                                <FileText className='h-4 w-4 text-primary' />
                                <span className='text-sm font-medium'>
                                    35 modules
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <TabsContent value={selectedTab?.value}>
                    <ProgramContent
                        option={{
                            isLoading: isProgramsLoading,
                            isError: false,
                            courseProgramsLoading,
                            setFilterOption,
                        }}
                        selectedTab={selectedTab}
                        fetchedData={fetchedData}
                        parentId={parentId}
                        setParentId={setParentId}
                        courseContentData={courseContentData}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
