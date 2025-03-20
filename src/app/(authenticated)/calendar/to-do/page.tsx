import TodoBoard from '@/components/calendar/ToDo/TodoBoard';
import GlobalHeader from '@/components/global/GlobalHeader';
import React from 'react';

const TodoPage = () => {
    return (
        <div className='py-2'>
            <GlobalHeader
                title='All To-Do'
                subTitle='Plan, Organize, and Stay On Track with all task'
            />
            <TodoBoard />
        </div>
    );
};

export default TodoPage;
