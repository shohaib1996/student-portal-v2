import React, { ReactNode } from 'react';
const defaultImage = '/empty_data.png';
import Image from 'next/image';
type TProps = {
    description?: string | ReactNode | undefined;
    image?: {
        height?: number;
        width?: number;
        src?: string | undefined;
    };
    footer?: ReactNode;
};
const EmptyData = (props: TProps) => {
    const {
        description = 'There is not data',
        image = {
            height: 90,
            width: 160,
            src: defaultImage,
        },
        footer,
    } = props;
    return (
        <div className='flex flex-col items-center'>
            <div className='image'>
                <Image
                    height={image.height}
                    width={image.width}
                    src={image.src || defaultImage}
                    alt='No Data Found'
                />
            </div>
            <div className='text-lg text-dark-gray'>{description}</div>
            {footer && <div className='empty_data_footer'>{footer}</div>}
        </div>
    );
};
export default EmptyData;
