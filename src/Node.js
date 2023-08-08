import React, { useRef, useEffect } from "react";
import { ANIMATION_TYPE } from "./Grid";

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
    animationType,
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
        ? animationType === ANIMATION_TYPE.swarm
          ? " visited-swarm"
          : " visited-fade"
        : isShortest
        ? " shortest"
        : "";
  }
  const nodeRef = useRef(null);

  useEffect(() => {
    nodeRef.current.addEventListener("animationend", handleAnimationEnd);

    return () => {
      let tempNodeRef = nodeRef;
      if (tempNodeRef.current)
        tempNodeRef.current.removeEventListener(
          "animationend",
          handleAnimationEnd
        );
    };
  }, [animationType]);

  useEffect(() => {
    nodeRef.current.addEventListener("animationend", handleAnimationEnd);

    return () => {
      let tempNodeRef = nodeRef;
      if (tempNodeRef.current)
        tempNodeRef.current.removeEventListener(
          "animationend",
          handleAnimationEnd
        );
    };
  }, []);

  const handleAnimationEnd = (e) => {
    if (
      e.target.classList.contains("visited-swarm") ||
      e.target.classList.contains("visited-fade")
    )
      setAnimationCount((prev) => prev + 1);
  };

  return (
    <div
      ref={nodeRef}
      className={classes}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      style={{
        width: `calc(60vw / ${gridSize})`,
        height: `calc(60vh / ${gridSize})`,
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
