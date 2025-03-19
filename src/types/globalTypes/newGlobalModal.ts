export interface IGlobalModalProps {
    /**
     * The text or element displayed on the button that triggers the modal.
     * - **Type:** `string | React.ReactNode`
     * - **Used in:** `<Button>` (inside `<DialogTrigger>`)
     * - **Example:** `"Open Modal"` or `<CustomButton />`
     * - **Tooltip Message:** "This is the text or component for the button that opens the modal."
     */
    triggerText: string | React.ReactNode;

    /**
     * Optional icon to display alongside the trigger text.
     * - **Type:** `React.ReactNode`
     * - **Used in:** `<Button>` (inside `<DialogTrigger>`)
     * - **Example:** `<Icon name="plus" />`
     * - **Tooltip Message:** "This icon will be displayed next to the trigger text inside the button."
     */
    triggerIcon?: React.ReactNode;

    /**
     * The title displayed at the top of the modal.
     * - **Type:** `string`
     * - **Used in:** `<DialogTitle>`
     * - **Example:** `"User Settings"`
     * - **Tooltip Message:** "This title appears at the top of the modal inside `<DialogTitle>`."
     */
    modalTitle?: string;

    /**
     * A brief description inside the modal.
     * - **Type:** `string`
     * - **Used in:** `<DialogDescription>`
     * - **Example:** `"Update your account information here."`
     * - **Tooltip Message:** "A short description explaining the purpose of the modal, placed inside `<DialogDescription>`."
     */
    modalDescription?: string;

    /**
     * Left-aligned content, such as an icon or additional details.
     * - **Type:** `React.ReactNode`
     * - **Used in:** Custom modal layout
     * - **Example:** `<UserAvatar />`
     * - **Tooltip Message:** "Additional content displayed on the left side of the modal."
     */
    leftContent?: React.ReactNode;

    /**
     * The main content inside the modal.
     * - **Type:** `React.ReactNode`
     * - **Used in:** `<DialogContent>` (as children)
     * - **Example:** `<FormComponent />`
     * - **Tooltip Message:** "This will be the main content displayed inside the modal."
     */
    children?: React.ReactNode;

    /**
     * Additional CSS classes for customization.
     * - **Type:** `string`
     * - **Used in:** `<DialogContent>`
     * - **Example:** `"bg-danger text-background"`
     * - **Tooltip Message:** "Apply custom styling to the modal using additional CSS classes."
     */
    className?: string;

    /**
     * Disables the trigger button when `true`.
     * - **Type:** `boolean`
     * - **Used in:** `<Button>` (inside `<DialogTrigger>`)
     * - **Example:** `disabled={isLoading}`
     * - **Tooltip Message:** "If true, the modal trigger button will be disabled."
     */
    disabled?: boolean;

    /**
     * Tailwind `ngClass` support for additional styling.
     * - **Type:** `string`
     * - **Used in:** `<Button>` (inside `<DialogTrigger>`)
     * - **Example:** `"border-2 border-danger"`
     * - **Tooltip Message:** "Allows passing dynamic Tailwind CSS classes for the button."
     */
    ngClass?: string;

    /**
     * Controls whether the modal is open or closed.
     * - **Type:** `boolean`
     * - **Used in:** `<Dialog>` (as `open` prop)
     * - **Example:** `open={isOpen}`
     * - **Tooltip Message:** "Determines if the modal is visible or hidden."
     */
    open: boolean;

    /**
     * Function to update the `open` state of the modal.
     * - **Type:** `React.Dispatch<React.SetStateAction<boolean>>`
     * - **Used in:** `<Dialog>` (as `onOpenChange` handler)
     * - **Example:** `setOpen(false)`
     * - **Tooltip Message:** "Use this function to open or close the modal."
     */
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;

    /**
     * Button variant for the trigger button.
     * - **Type:** Predefined button styles.
     * - **Used in:** `<Button>` component.
     * - **Example:** `"primary"`, `"outline"`
     * - **Tooltip Message:** "Defines the button style variant."
     */
    triggerButtonVariant?:
        | 'default'
        | 'update'
        | 'foreground'
        | 'danger'
        | 'outline'
        | 'secondary'
        | 'ghost'
        | 'link'
        | undefined;

    /**
     * Size variant for the trigger button.
     * - **Type:** Predefined size options.
     * - **Used in:** `<Button>` component.
     * - **Example:** `"sm"`, `"lg"`, `"icon"`
     * - **Tooltip Message:** "Defines the button size variant."
     */
    triggerButtonVariantSize?: 'default' | 'sm' | 'lg' | 'icon' | undefined;

    /**
     * The main content inside the modal.
     * - **Type:** `React.ReactNode`
     * - **Used in:** `<DialogContent>` (as children)
     * - **Example:** `<FormComponent />`
     * - **Tooltip Message:** "This content will be displayed inside the modal body."
     */
    modalContent?: React.ReactNode;
}
