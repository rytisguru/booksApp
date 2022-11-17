import { ReactSearchAutocomplete } from 'react-search-autocomplete'

import './SearchBox.styles.scss'

const SearchBox = ({ books, setIndex }) => {

    const handleOnSelect = (item) => {
        const newArray = [...books]
        setIndex(newArray.findIndex(book => book.id === item.id))
    }

    const handleOnClear = () => {
        setIndex(-1)
    }

    return (
        <div className='search-container'>
            <ReactSearchAutocomplete
                items={books}
                onSelect={handleOnSelect}
                onClear={handleOnClear}
            />
        </div>
    )
}

export default SearchBox;