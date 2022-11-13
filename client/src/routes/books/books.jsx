import { useState, useEffect } from 'react';
import { asyncEmit } from './../../tools/asyncEmit';
import { makeRequest } from './../../tools/makeRequest';
import BookForm from './../../components/BookForm/BookForm';

import './books.styles.scss';

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
    const [cursor, setCursor] = useState(null);
    const [isNext, setIsNext] = useState(false);
    const [isPrev, setIsPrev] = useState(true);

    useEffect(() => {
        socket.on('setImage', ({ fileName }) => {
            updateData({ image: fileName })
        });
    }, [socket]);

    useEffect(() => {
        if (cursor === null) {
            const getRow = async () => {
                await makeRequest('/getLatestRow')
                    .then(response => {
                        if (response) setCursor(response.id)
                    })
                    .catch(setIsPrev(false))
            }
            getRow();
        } else {
            const checkPrev = async () => {
                await makeRequest('/prevBook/' + cursor)
                    .then(prev => {
                        if (prev !== null) { setIsPrev(true); return; }
                        setIsPrev(false);
                    })
            }
            checkPrev();
        }
    }, [cursor])

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
        if (id !== null && status) {
            setCursor(id);
        } else {
            console.log(error)
            return
        }

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

    const goPrev = async () => {
        if (tempData.length === 0) setTempData(data);
        if (!isNext) {
            await makeRequest('/getLatestRow').then(newData => {
                setData(newData)
                setIsNext(true)
            })
            return;
        }
        await makeRequest('/prevBook/' + cursor)
            .then(newData => {
                setData(newData)
                setCursor(newData.id)
                const checkIsFirst = async () => {
                    await makeRequest('/prevBook/' + newData.id)
                        .then(response => {
                            if (response === null) setIsPrev(false)
                        })
                }
                checkIsFirst()
            })
    }

    const goNext = async () => {
        const response = await makeRequest('/getLatestRow')
        if (response.id !== null && response.id === cursor) {
            setData(tempData)
            setTempData([])
            setIsNext(false)
            return;
        }
        await makeRequest('/nextBook/' + cursor)
            .then(newData => {
                setData(newData)
                setCursor(newData.id)
            })
    }

    return (
        <div className="books-container">
            {isNext && <button onClick={goNext} className="next-btn">PIRMYN</button>}
            {isPrev && <button onClick={goPrev} className="prev-btn">ATGAL</button>}
            <BookForm
                data={data}
                updateData={updateData}
                onSubmit={onSubmit}
                onEdit={onEdit}
            />
        </div>
    )
}

export default Books;