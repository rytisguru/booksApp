import { BrowserRouter, Routes, Route } from 'react-router-dom';
import socketIO from 'socket.io-client';

import Home from './routes/home/home.jsx';
import Photo from './routes/photo/photo.jsx';
import Books from './routes/books/books';

const socket = socketIO.connect(process.env.REACT_APP_SERVER_URL);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/photo" element={<Photo socket={socket} />}></Route>
        <Route path="/books" element={<Books socket={socket} />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
