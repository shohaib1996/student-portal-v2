import { BootcampsSection } from './bootcamps-section';
import { CalendarSection } from './calendar-section';
import { ChatsSection } from './chats-section';
import { CoursesSection } from './courses-section';
import { DashboardTitle } from './dashboard-title';
import { DocumentsSection } from './documents-section';
import { MockInterviewSection } from './mock-interview-section';
import { OthersSection } from './others-section';
import { OverallProgress } from './overall-progress';
import { ProfileSection } from './profile-section';
import { TechnicalTestSection } from './technical-test-section';
import { TodoSection } from './todo-section';

export default function DashboardBody() {
    return (
        <div className=''>
            <DashboardTitle />

            <div className='grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-2 my-2'>
                <OverallProgress />
                <CalendarSection />
                <TodoSection />
                <BootcampsSection />
                <CoursesSection />
                <MockInterviewSection />
                <ChatsSection />
                <DocumentsSection />
                <TechnicalTestSection />
                <ProfileSection />
                <OthersSection />
            </div>
        </div>
    );
}
