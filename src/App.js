import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Spinner, Image} from 'react-bootstrap';
import RangeSlider from 'react-bootstrap-range-slider';
import { useDropzone } from 'react-dropzone';
import Result from './components/Result';
import 'react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css';
import './App.css';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function App() {
  const [imageFile, setImageFile] = useState(null);
  const [labels, setLabels] = useState([]);
  const [minConfidence, setMinConfidence] = useState(0.5);
  const [isLoading, setIsLoading] = useState(false);
  const [showReject, setReject] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleDrop = (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      setReject(true);
    } else {
      setReject(false);
      setImageFile(Object.assign(acceptedFiles[0], {
        preview: URL.createObjectURL(acceptedFiles[0])
      }));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setIsLoading(true);
    setErrorMessage("");

    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('minConfidence', minConfidence);

    axios.post('/evaluate', formData)
      .then(response => {
        setLabels(response.data);
        setIsLoading(false);
      })
      .catch(error => {
        // 处理错误信息
        if (error.response) {
          // 请求成功，但是服务器返回错误状态码
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
          setErrorMessage(error.response.data);
        } else if (error.request) {
          // 请求没有响应
          console.log(error.request);
          setErrorMessage("No response was received.");
        } else {
          // 发送请求时出现错误
          console.log('Error', error.message);
          setErrorMessage("An error occurred while sending request.");
        }
        setIsLoading(false);
      });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
    },
    maxSize: MAX_FILE_SIZE,
    multiple: false,
  });

  const handleConfidenceChange = (event) => {
    setMinConfidence(parseFloat(event.target.value));
  };

  const handleBack = () => {
    setImageFile(null);
    setLabels([]);
    setErrorMessage("");
  };

  useEffect(() => {
    // Revoke the data uris to avoid memory leaks, will run on unmount
    return () => imageFile ? URL.revokeObjectURL(imageFile.preview) : "";
  }, [imageFile]);

  return (
    <div className="bg-light min-vh-100 d-flex align-items-center">
      <Container className="bg-white rounded">
        <Container className="app-container py-5">
          <Row>
            <Col className="text-center">
              <h1>Deep Danbooru</h1>
            </Col>
          </Row>
          <Container className="upload-container text-center mt-5">
            <Form onSubmit={handleSubmit}>
              <Form.Group>
                <div
                  {...getRootProps()}
                  className={`dropzone ${imageFile ? '' : 'p-5'} mt-4 mb-3 text-center ${isDragActive ? 'drop text-black' : ''} ${showReject ? 'error' : ''}`}
                >
                  <input {...getInputProps()} />
                  {imageFile ? (
                    <div className="previews d-flex">
                      <Image className="h-100" style={{objectFit: 'contain', maxWidth: "100%"}} src={imageFile.preview}/>
                    </div>
                  ) : (
                    <p>{showReject ? "File must be a JPEG or PNG image which is smaller than 10 MB." : "Drag 'n' drop some files here, or click to select files"}</p>
                  )}
                </div>
              </Form.Group>
              <Form.Group>
                <Form.Label>Minimum confidence</Form.Label>
                <RangeSlider
                  min={0.35}
                  max={1}
                  step={0.01}
                  value={minConfidence}
                  tooltip="auto"
                  onChange={handleConfidenceChange}
                />
                <Form.Text>
                  You can upload JPEG or PNG image which is smaller than 10 MB.<br />
                  Uploaded image is automatically removed from server after evaluating.
                </Form.Text>
              </Form.Group>
              <Button
                type="submit"
                disabled={!imageFile || isLoading}
                variant="primary"
                className="w-50 mt-2"
              >
                {isLoading ? (
                  <>
                    Evaluating... <Spinner animation="border" size="sm" />
                  </>
                ) : 'Upload'}
              </Button>
            </Form>
          </Container>
          <Container className="result-container">
            <Row className="mt-5">
              <Col>
                <h2>Result</h2>
                {errorMessage.length > 0 && (
                  <p>{`${errorMessage}`}</p>
                )}
                {imageFile && labels.length > 0 && (
                  <Result labelsData={labels} handleBack={handleBack}/>
                )}
              </Col>
            </Row>
          </Container>
        </Container>
      </Container>
    </div>
  );
}

export default App;