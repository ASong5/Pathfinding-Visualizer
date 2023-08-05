import React, { useRef, useEffect } from "react";

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
    weight,
    setAnimationCount,
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
  const nodeRef = useRef(null);

  useEffect(() => {
    nodeRef.current.addEventListener("animationend", handleAnimationEnd);

    return () => {
      let tempNodeRef = nodeRef;
      if(tempNodeRef.current)
      tempNodeRef.current.removeEventListener("animationend", handleAnimationEnd);
    };
  }, []);

  const handleAnimationEnd = () => {
    setAnimationCount((prev) => prev + 1);
  };

  return (
    <div
      ref={nodeRef}
      className={classes}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      style={{
        width: `calc(75vw / ${gridSize})`,
        height: `calc(75vh / ${gridSize})`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {weight > 0 ? `${weight}` : ""}
    </div>
  );
};

export default Node;
