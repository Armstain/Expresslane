import BookParcelForm from '@/components/Form/BookParcelForm.jsx';
import PageHeader from '@/components/Shared/PageHeader.jsx';

const BookParcel = () => (
    <>
        <PageHeader
            title='Book a parcel'
            description='Fill in the details below — you’ll see the price before you confirm.'
        />
        <BookParcelForm />
    </>
);

export default BookParcel;
