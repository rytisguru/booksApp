import CustomInput from '../CustomInput/CustomInput';
import Spinner from './../spinner/spiner.component';

import './BookForm.styles.scss';

const BookForm = ({ data, updateData, onSubmit, onEdit, authors }) => {

    // const Image = () => {
    //     const [image, setImage] = useState(null);

    //     useEffect(() => {
    //         if (data.image !== '') {
    //             const getImage = async () => await makeRequest('/images/' + data.image)
    //                 .then(resp => setImage(base64.decode(resp)));
    //             getImage();
    //         }
    //     }, [image, data.image])

    //     console.log(image)

    //     return image !== null
    //         ? <img src={image} alt="" />
    //         : <Spinner />
    // }

    return (
        <>
            <div className="form-inputs">
                <CustomInput
                    name="title"
                    title="Pavadinimas"
                    value={data.title}
                    updateData={updateData}
                    focus={true}
                />
                <CustomInput
                    name="author"
                    title="Autorius"
                    value={data.author}
                    updateData={updateData}
                    dataList="authors"
                />
                <datalist id="authors">
                    {authors.map(author => <option key={author} value={author}></option>)}
                </datalist>
                <CustomInput
                    name="year"
                    title="Metai"
                    type="number"
                    value={data.year}
                    updateData={updateData}
                />
                <CustomInput
                    name="pages"
                    title="Puslapiai"
                    type="number"
                    value={data.pages}
                    updateData={updateData}
                />
                <CustomInput
                    name="section"
                    title="Sekcija"
                    value={data.section}
                    updateData={updateData}
                />
                <CustomInput
                    name="shelf"
                    title="Lentyna"
                    type="number"
                    value={data.shelf}
                    updateData={updateData}
                />
                <CustomInput
                    name="price"
                    title="Kaina"
                    type="number"
                    value={data.price}
                    updateData={updateData}
                />
                <div className='form-button'>
                    {data.id
                        ? <button className="btn" onClick={onEdit}>ATNAUJINTI</button>
                        : <button className="btn" onClick={onSubmit}>ISSAUGOTI</button>
                    }
                </div>
            </div>
            <div className="form-image">
                {data.image === ""
                    ? <Spinner />
                    : <img src={process.env.REACT_APP_SERVER_URL + '/images/' + data.image} alt="" />
                }
            </div>
        </>
    )
}

export default BookForm;