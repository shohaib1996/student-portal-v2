interface FormattingDateProps {
    date: string | Date;
    className?: string;
}

/**
 * 🚀 **FormattingDate Component**
 * A simple utility component to format and display a date string in a human-readable format. It accepts a `date` value (either string or Date object) and formats it into a more concise representation (e.g., "Feb 4, 2025").
 * This component is ideal for displaying formatted dates across various parts of your application.
 *
 * ✅ **Required Props:**
 * - `date`: The date to be formatted. It can either be a `string` or a `Date` object.
 *
 * 🎨 **Optional Props:**
 * - `className`: Custom styles or classes to apply to the formatted date element.
 *
 * 💡 **Usage:**
 * This component takes a `date` prop, which can be either a string or a `Date` object, and formats it to display in the "MMM dd, yyyy" format (e.g., "Feb 4, 2025").
 * You can also pass a `className` to customize the styling of the displayed date.
 *
 * 🎯 **Features:**
 * - **Date Formatting**: The component formats the date into a readable format using `toLocaleDateString`, allowing for automatic localization.
 * - **Custom Styling**: The `className` prop allows for easy customization and styling of the date display.
 * - **Flexible Input**: The `date` can be provided as either a string or a `Date` object, making it versatile.
 *
 * ⚙️ **Important:**
 * - **Locale**: The component currently uses the "en-US" locale for date formatting. You can adjust it if needed.
 * - **Invalid Date Handling**: If an invalid date is passed, JavaScript's `Date` object will handle it by returning "Invalid Date". You might want to handle this case separately if needed.
 * - **Performance**: The component uses JavaScript’s built-in `Date` API for formatting, which is suitable for most use cases but might not support all date formats or edge cases.
 *
 * 🎨 **Customization:**
 * - The date format is currently set to `"en-US"` with short month names and numeric day and year, but this can be adjusted by passing options to the `toLocaleDateString` method.
 * - The `className` prop can be used to pass custom styling, ensuring it fits seamlessly with your app's design.
 */

const FormattingDate: React.FC<FormattingDateProps> = ({ date, className }) => {
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    return <span className={className}>{formattedDate}</span>;
};

export default FormattingDate;
