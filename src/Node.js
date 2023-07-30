import React from "react";

const Node = (props) => {
  const {
    start,
    end,
    isWall,
    isVisited,
    isShortest,
    onClick,
    onMouseEnter,
    gridSize,
  } = props;

  let classes = "node";
  if (start) classes += " start";
  else if (end) classes += " end";
  else if (isWall) classes += " wall";
  else {
    classes +=
      isVisited && isShortest
        ? " shortest"
        : isVisited
        ? " visited"
        : isShortest
        ? " shortest"
        : "";
  }

  return (
    <div
      className={classes}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      style={{
        width: `calc(75vw / ${gridSize})`,
        height: `calc(75vh / ${gridSize})`,
      }}
    ></div>
  );
};

export default Node;
