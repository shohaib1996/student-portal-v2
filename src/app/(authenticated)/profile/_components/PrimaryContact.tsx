'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useSelector } from 'react-redux';

const PrimaryContact = () => {
    const { user } = useSelector(
        (state: { auth: { user: any } }) => state.auth,
    );
    const phone = '+' + user?.phone?.countryCode + user?.phone?.number;

    return (
        <section>
            <h4 className='mb-common text-2xl font-medium text-gray'>
                Primary Contacts
            </h4>
            <div className='grid gap-common md:grid-cols-2'>
                <div>
                    <Label className='mb-common flex items-center gap-common text-sm font-semibold text-gray'>
                        Email Address{' '}
                        {user?.isEmailVerified?.status === true ? (
                            <span className='text-primary'>(Verified)</span>
                        ) : (
                            <span className='text-danger/50'>
                                (Not Verified)
                            </span>
                        )}
                    </Label>
                    <Input
                        value={user?.email || ''}
                        className='cursor-not-allowed bg-foreground py-common text-gray'
                        readOnly
                    />
                </div>
                <div>
                    <Label className='mb-common flex items-center gap-common text-sm font-semibold text-gray'>
                        Mobile Number{' '}
                        {user?.phone?.isVerified === true ? (
                            <span className='text-primary'>(Verified)</span>
                        ) : (
                            <span className='text-danger/80'>
                                (Not Verified)
                            </span>
                        )}
                        <Button
                            variant='link'
                            className='h-auto p-0 text-primary'
                        >
                            Verify Now
                        </Button>
                    </Label>
                    <PhoneInput
                        country={'bd'}
                        onlyCountries={['ca', 'bd', 'us']}
                        value={phone || ''}
                        containerStyle={{ width: '100%' }}
                        containerClass='tests'
                        inputClass='rounded-lg text-gray disabled:opacity-100'
                        inputStyle={{
                            width: '100%',
                            height: '40px',
                            paddingLeft: '50px',
                            borderRadius: '6px',
                        }}
                        buttonStyle={{
                            border: 'none',
                            background: 'transparent',
                        }}
                        disabled={true}
                    />
                </div>
            </div>
        </section>
    );
};

export default PrimaryContact;
