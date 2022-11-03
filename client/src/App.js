import './App.css';
import { useState, useEffect } from 'react';
import socketIO from 'socket.io-client';

const socket = socketIO.connect('http://localhost:4000');

function App() {
  const [img, setImg] = useState('')

  useEffect(() => {
    socket.on('setImage', ({ url }) => setImg(url));
  }, [socket, img]);

  const onSubmit = (e) => {
    e.preventDefault()

    socket.emit("getImage")
  }

  return (
    <div className="container">
      <form onSubmit={onSubmit}>
        <input name="title" type="text" />
        {img}
        <button type="submit">GET IMAGE</button>
      </form>
    </div>
  );
}

export default App;
