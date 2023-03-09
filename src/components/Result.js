import React from "react";
import { ProgressBar, Row, Col, Button } from "react-bootstrap";

function TagProgressBar(props) {
  const { tag, confidence } = props;

  return (
    <>
      <div>{tag}</div>
      <ProgressBar
        variant="info"
        max={1}
        min={0}
        now={confidence}
        label={confidence}
        className="my-1"
        style={{
          height: "20px",
        }}
      />
    </>
  );
}

function TagsOnlyText(props) {
  const { labelsData } = props;
  const len = labelsData.length - 1;
  return labelsData.map((label, idx) => (
    <span style={{opacity: label.confidence}} key={label.tag}>{label.tag}{`${idx === len ? "" : ", "}`}</span>
  ))
}

function TagProgressBarList(props) {
  const { labelsData } = props;
  const tagProgressBarList = labelsData.map((label) => (
    <TagProgressBar key={label.tag} tag={label.tag} confidence={label.confidence} />
  ));

  return <div>{tagProgressBarList}</div>;
}

function Result(props) {
  return (
    <>
      <Row>
        <Col>
          <h4>Tags only:</h4>
          <TagsOnlyText labelsData={props.labelsData} />
        </Col>
        <Col>
          <h4>Tags and Confidence:</h4>
          <TagProgressBarList labelsData={props.labelsData} />
        </Col>
      </Row>
      <Button variant="primary" onClick={props.handleBack} className="mb-3">
        Back to Upload
      </Button>
    </>
  );
}

export default Result;