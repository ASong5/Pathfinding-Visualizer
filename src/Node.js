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

  return (
    <div
      className={`node ${
        !start && !end
          ? isWall
            ? "wall"
            : isVisited
            ? "visited"
            : isShortest
            ? "shortest"
            : ""
          : start
          ? "start"
          : end
          ? "end"
          : ""
      }`}
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
