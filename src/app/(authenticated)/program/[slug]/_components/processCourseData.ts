// interface Chapter {
//     isFree: boolean;
//     _id: string;
//     name: string;
//     description: string | null;
//     subTitle: string;
//     subDescription: string;
//     image: string;
//     updatedAt?: string;
// }

// interface Lesson {
//     type: string;
//     isFree: boolean;
//     duration: number;
//     _id: string;
//     title: string;
//     url: string;
//     updatedAt?: string;
// }

// interface MyCourse {
//     isOwner: boolean;
//     isPublished: boolean;
//     groups: string[];
//     sessions: string[];
//     isPreview: boolean;
//     _id?: string;
//     course: string;
//     parent: string;
//     prev: string;
//     category: string;
// }

// interface CourseItem {
//     type: string;
//     priority: number;
//     _id: string;
//     chapter?: Chapter;
//     lesson?: Lesson;
//     category: string;
//     index?: number;
//     updatedAt: string;
//     attachments: any[];
//     myCourse: MyCourse;
//     isPinned: boolean;
//     isCompleted: boolean;
//     isFocused: boolean;
//     isLocked: boolean;
//     isSpecial: boolean;
//     isExpanded: boolean;
// }

// interface ProcessedData {
//     noParentItems: CourseItem[];
//     parentGroupedItems: Record<string, CourseItem[]>;
// }

// export function processCourseData(data: CourseItem[]): ProcessedData {
//     const noParentItems: CourseItem[] = [];
//     const parentGroupedItems: Record<string, CourseItem[]> = {};

//     // Process items to separate no-parent and parent-grouped items
//     data?.forEach((item, index) => {
//         // Update prev to reference previous item's _id if it exists
//         if (index > 0) {
//             item.myCourse?.prev = data[index - 1]._id;
//         } else {
//             item.myCourse?.prev = '';
//         }

//         // Separate items based on parent
//         if (!item?.myCourse?.parent) {
//             noParentItems.push({ ...item, isExpanded: false });
//         } else {
//             if (!parentGroupedItems[item.myCourse?.parent]) {
//                 parentGroupedItems[item.myCourse?.parent] = [];
//             }
//             parentGroupedItems[item.myCourse?.parent].push({
//                 ...item,
//                 isExpanded: false,
//             });
//         }
//     });

//     return {
//         noParentItems,
//         parentGroupedItems,
//     };
// }

// // Example usage:
