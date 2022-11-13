//import React, { useState } from "react";
import Camera, { IMAGE_TYPES } from "react-html5-camera-photo";
import "react-html5-camera-photo/build/css/index.css";

const Photo = ({ socket }) => {

    //const [images, setImages] = useState([]);

    const onTakePhotoHandler = (dataUri) => {
        //const newImages = [...images];
        //newImages.push(dataUri);
        //setImages(newImages);
        socket.emit("saveImage", { image: dataUri })
    };

    return (
        <div>
            <Camera
                onTakePhoto={onTakePhotoHandler}
                idealFacingMode="environment"
                imageType = {IMAGE_TYPES.JPG}
                isImageMirror={false}
            />
            {/* <div style={{ display: "flex", flexDirection: "row" }}>
                {images.map((image, index) => (
                    <div key={index} style={{ width: "150px", paddingRight: "12px" }}>
                        <img alt="cam" src={image} style={{ width: "100%" }} />
                    </div>
                ))}
            </div> */}
        </div>
    )
}

export default Photo;