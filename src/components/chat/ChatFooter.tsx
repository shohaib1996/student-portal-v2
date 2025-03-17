'use client';

import type React from 'react';
import dayjs from 'dayjs';
import { useDispatch } from 'react-redux';
import TextEditor from './TextEditor/page';

interface MuteData {
    isMuted: boolean;
    date?: string | Date;
    note?: string;
}

interface MuteMessageProps {
    muteData: MuteData;
}

export interface ChatData {
    _id?: string;
    isReadOnly?: boolean;
    myData?: {
        role?: string;
        mute?: MuteData;
    };
}

interface ChatFooterProps {
    chat?: ChatData;
    reply?: boolean;
    scrollIntoBottom?: () => void;
    parentMessage?: any;
    onSentCallback?: (data: any) => void;
    selectedMessage?: any;
    setProfileInfoShow?: (show: boolean) => void;
    profileInfoShow?: boolean;
    className?: string;
    draft?: any;
}

function MuteMessage({ muteData }: MuteMessageProps) {
    if (!muteData.isMuted) {
        return null;
    }

    return (
        <div className='text-center'>
            <p className='text-red-500 text-center text-lg my-2.5 font-bold'>
                You have been muted from this crowd
                {muteData.date && (
                    <>
                        {' '}
                        - until (
                        {dayjs(muteData.date).format('D MMM, YYYY hh:mm a')})
                    </>
                )}
            </p>
            {muteData.note && (
                <b className='text-foreground'>Reason: {muteData.note}</b>
            )}
        </div>
    );
}

const ChatFooter: React.FC<ChatFooterProps> = ({
    chat,
    reply,
    scrollIntoBottom,
    parentMessage,
    onSentCallback,
    selectedMessage,
    setProfileInfoShow,
    profileInfoShow,
    className,
}) => {
    const dispatch = useDispatch();

    if (chat?.isReadOnly && chat?.myData?.role === 'member') {
        return (
            <div className='mb-8 p-4 border-t border-border'>
                <p className='text-center font-bold text-base'>
                    This is a read only crowd! Only admins can send message
                </p>
            </div>
        );
    }

    const isMutedWithoutDate =
        chat?.myData?.mute?.isMuted && !chat?.myData?.mute?.date;

    const isMutedWithFutureDate =
        chat?.myData?.mute?.isMuted &&
        dayjs(chat.myData.mute.date).isAfter(dayjs());

    return (
        <>
            <div className='border-t border-border p-2'>
                {isMutedWithoutDate || isMutedWithFutureDate ? (
                    <MuteMessage muteData={chat?.myData?.mute as MuteData} />
                ) : (
                    <>
                        {reply ? (
                            // <TextEditorReply
                            //     chatId={chat?._id}
                            //     parentMessage={parentMessage}
                            //     onSentCallback={onSentCallback}
                            //     selectedMessage={selectedMessage}
                            //     setProfileInfoShow={setProfileInfoShow}
                            //     profileInfoShow={profileInfoShow}
                            //     chat={chat}
                            // />
                            <p>Reply Coming soon!</p>
                        ) : (
                            <TextEditor
                                chatId={chat?._id}
                                parentMessage={parentMessage}
                                onSentCallback={onSentCallback}
                                selectedMessage={selectedMessage}
                                setProfileInfoShow={setProfileInfoShow}
                                profileInfoShow={profileInfoShow}
                                chat={chat}
                            />
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default ChatFooter;
