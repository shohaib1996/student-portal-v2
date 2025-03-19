import type React from 'react';
import ChatInfo from './ChatInfo';

interface ProfileInfoProps {
    handleToggleInfo: () => void;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({ handleToggleInfo }) => {
    return (
        <>
            <div className='bg-background border-l border-border h-[calc(100vh-60px)] overflow-auto'>
                <ChatInfo handleToggleInfo={handleToggleInfo} />
            </div>
        </>
    );
};

export default ProfileInfo;
