import React, { useState } from "react";
import axios from "axios";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "./App.scss";

const App = () => {
  const [file, setFile] = useState(null);
  const [uploadProgress, updateUploadProgress] = useState(0);
  const [imageURI, setImageURI] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(false);
  const [uploading, setUploading] = useState(false);

  const acceptedTypes = [
    'image/png',
    'image/jpg',
    'image/jpeg',
  ];

  const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
  }

  const isValidFileType = (fileType) => {
    return acceptedTypes.includes(fileType);
  };

  const handleFileUpload = (event) => {
    event.preventDefault();

    console.log("handleFileUpload", file)

    if (!isValidFileType(file.type)) {
        alert('Only images are allowed (png or jpg)');
        return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    axios({
        method: 'post',
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        data: formData,
        url: 'http://localhost:8000/upload',
        onUploadProgress: (size) => {
            const progress = size.loaded / size.total * 100;
            updateUploadProgress(Math.round(progress));
        },
    })
    .then((response) => {
        setUploadStatus(response);
        setUploading(false);
        getBase64(file, (uri) => {
            setImageURI(uri);
        });
    })
    .catch((err) => console.error(err));
  };

  return (
    <div className="app">
      <div className="image-preview">
        {(uploadStatus && imageURI)
          ? <img src={imageURI} alt="preview" />
          : <div>A preview of {file ? file.name : "your photo"} will appear here.</div>
        }
      </div>

      <form className="form" onSubmit={handleFileUpload}>
        <button className="file-picker" type="button">
          Choose file...

          <input
            className="file-input"
            type="file"
            name="file"
            accept={acceptedTypes.toString()}
            onChange={event => {
              if (event.target.files && event.target.files.length > 0) {
                setFile(event.target.files[0]);
              }
            }}
          />
        </button>

        <button className="upload-button" type="submit">
          Submit
        </button>
      </form>

      {uploading
        &&
        <div className="progress-bar-container">
            <CircularProgressbar
                value={uploadProgress}
                text={`${uploadProgress}% uploaded`}
                styles={buildStyles({
                    textSize: '10px',
                    pathColor: 'teal',
                })}
            />
        </div>
      }
    </div>
  );
}

export default App;
