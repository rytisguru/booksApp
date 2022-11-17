import { useState, useEffect } from 'react';
import { asyncEmit } from './../../tools/asyncEmit';
import { makeRequest } from './../../tools/makeRequest';
import BookForm from './../../components/BookForm/BookForm';

import './books.styles.scss';
import SearchBox from './../../components/SearchBox/SearchBox';

const INITIAL_DATA = {
    title: "",
    author: "",
    year: "",
    pages: "",
    section: "",
    shelf: "",
    price: "",
    image: ""
}

const Books = ({ socket }) => {

    const [data, setData] = useState(INITIAL_DATA);
    const [tempData, setTempData] = useState([]);

    const [index, setIndex] = useState(-1);
    const [isNext, setIsNext] = useState(false);
    const [isPrev, setIsPrev] = useState(true);

    const [authors, setAuthors] = useState([]);
    const [books, setBooks] = useState([]);

    useEffect(() => {
        const getAuthors = async () => {
            const fetchAuthors = await makeRequest('/getAuthors')
            setAuthors(fetchAuthors)
        }
        const getBooks = async () => {
            const getBooks = await makeRequest('/getBooks')
            setBooks(getBooks)
        }
        getAuthors()
        getBooks()
    }, [])

    useEffect(() => {
        socket.on('setImage', ({ fileName }) => {
            updateData({ image: fileName })
        });
    }, [socket]);

    useEffect(() => {
        if (index !== -1) {
            if (tempData.length === 0) {
                setTempData(data)
            }
            setIsPrev(true)
            if (index === books.length - 1) {
                setIsPrev(false)
            }
            setIsNext(true)
            const getData = async () => {
                const newData = await makeRequest('/getBook/' + books[index].id);
                setData(newData);
            }
            getData();
        } else {
            setIsNext(false)
            if (tempData.length !== 0) {
                setData(tempData);
                setTempData([]);
            }
        }
    }, [index])

    const updateData = (field) => {
        setData(prev => {
            return { ...prev, ...field }
        })
    }

    const onSubmit = async (e) => {
        e.preventDefault()

        const isAllFilled = Object.values(data).every(value => {
            if (value === '') { return false; } return true;
        });
        if (!isAllFilled) {
            alert("Ne viskas uzpildyta.");
            return;
        }

        const { id, status, error } = await asyncEmit("saveData", { data }, socket)
        if (!status) {
            console.log("KLAIDA")
            console.log(error)
            return
        }

        if (!authors.includes(data.author)) {
            const tempAuthors = authors;
            tempAuthors.push(data.author)
            setAuthors(tempAuthors.sort((a, b) => a.localeCompare(b)))
        }

        const newArray = books;
        newArray.unshift({ id: id, name: data.title });
        setBooks(newArray);

        setData(INITIAL_DATA)
        setData(prev => {
            return { ...prev, section: data.section, shelf: data.shelf }
        })
    }

    const onEdit = async (e) => {
        e.preventDefault()

        const isAllFilled = Object.values(data).every(value => {
            if (value === '') { return false; } return true;
        });
        if (!isAllFilled) {
            alert("Ne viskas uzpildyta.");
            return;
        }

        const { status, error } = await asyncEmit("updateData", { data }, socket)
        if (status) {
            alert("ATNAUJINTA SEKMINGAI")
        } else {
            console.log(error)
            return
        }
    }

    const goPrev = () => setIndex(index + 1)
    const goNext = () => setIndex(index - 1)

    return (
        <div className="books-container">
            {isNext && <button onClick={goNext} className="next-btn">PIRMYN</button>}
            {isPrev && <button onClick={goPrev} className="prev-btn">ATGAL</button>}
            <SearchBox books={books} setIndex={setIndex} />
            <BookForm
                data={data}
                updateData={updateData}
                onSubmit={onSubmit}
                onEdit={onEdit}
                authors={authors}
            />
        </div>
    )
}

export default Books;