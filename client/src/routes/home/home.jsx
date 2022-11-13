import { Link } from "react-router-dom";

import './home.styles.scss';

const Home = () => {

    return (
        <div className="home-container">
            <Link to="/books">KOMPIUTERIS</Link>
            <Link to="/photo">TELEFONAS</Link>
        </div>
    )

}

export default Home;