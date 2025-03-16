'use client';

import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { ReactElement, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type FormConfig = {
    defaultValues?: Record<string, any>;
    resolver?: any;
};

type FormProps = {
    children?: ReactElement | ReactNode;
    onSubmit: SubmitHandler<any>;
    className?: string;
} & FormConfig;

/**
 * 📝 **PortalForm Component**
 * A flexible form component built on `react-hook-form` to manage form state, validation, and submission.
 * This component simplifies form management and allows you to pass children for form fields while managing validation and default values.
 *
 * ✅ **Required Props:**
 * - `onSubmit`: A callback function to handle form submission. This function will be triggered when the form is submitted successfully.
 *
 * ⚙️ **Optional Props:**
 * - `children`: The form fields (e.g., inputs, selects) you wish to include inside the form. It should be React elements or nodes.
 * - `resolver`: An optional validation resolver (such as `zod`, `yup`, etc.) used for form validation.
 * - `defaultValues`: Optional default values for the form fields. This can be passed as a `Record<string, any>` or `undefined`.
 * - `className`: Optional additional CSS classes to apply to the form's container.
 *
 * 🎯 **Usage:**
 * This component can be used to manage any form with flexible field validation and custom styling. It works with the `react-hook-form` library to handle form state management, making it easy to control form data, validation, and submission logic.
 *
 * 💡 **Features:**
 * - Automatically integrates with `react-hook-form` to manage form state and validation.
 * - Supports dynamic form field validation via the `resolver` prop.
 * - Allows the use of default form values for pre-filling forms.
 * - Customizable container styling via the `className` prop.
 * - Flexible enough to work with any form structure via the `children` prop.
 *
 * ⚠️ **Important Notes:**
 * - The `onSubmit` function must be provided and will receive the form data when the form is submitted.
 * - The `children` prop should contain React form components (such as input fields, selects, etc.).
 * - You must ensure proper integration of a validation schema or resolver if validation is needed (e.g., `yup`, `zod`).
 * - Ensure that the form fields match the names of the properties defined in `defaultValues` (if used).
 *
 * 🧑‍🏫 **Detailed Explanation of Types and Props:**
 *  `FormConfig` Type
 * - **defaultValues**: `Record<string, any> | undefined` - Holds the default values of the form fields.
 * - **resolver**: `any` - A validation resolver used to validate the form.
 *  `FormProps` Type
 * - **children**: `ReactElement | ReactNode | undefined` - The form fields and components to render.
 * - **onSubmit**: `SubmitHandler<any>` - The function to handle form submission.
 * - **className**: `string | undefined` - Custom CSS classes to apply to the form container.
 *
 *  **Working with `useForm` Hook**
 * Inside the component, `useForm` is used to handle form state and validation:
 * - `formConfig` is passed to `useForm` for configuration.
 * - `FormProvider` wraps the form to provide access to form methods.
 * - The form is rendered with `methods.handleSubmit(onSubmit)` to submit data.
 */

export default function PortalForm({
    onSubmit,
    children,
    resolver,
    defaultValues,
    className,
}: FormProps) {
    const formConfig: FormConfig = {};
    if (resolver) {
        formConfig['resolver'] = resolver;
    }

    if (defaultValues) {
        formConfig['defaultValues'] = defaultValues;
    }

    const methods = useForm(formConfig);

    return (
        <FormProvider {...methods}>
            <Form {...methods}>
                <form
                    className={cn(`gap-common flex flex-col`, className)}
                    onSubmit={methods.handleSubmit(onSubmit)}
                >
                    {children}
                </form>
            </Form>
        </FormProvider>
    );
}
