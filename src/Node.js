import React from "react";
import { ANIMATION_TYPE } from "./Grid";

const path = process.env.PUBLIC_URL;
const logo = "/images/wall-texture.png";

const Node = (props) => {
  const {
    start,
    end,
    isWall,
    isVisited,
    isShortest,
    onClick,
    onMouseEnter,
    weight,
    animationType,
    isDarkMode,
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

  return (
    <div
      className={`${classes} ${isDarkMode ? "dark-mode-node" : ""}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      style={{
        backgroundImage: isWall ? `url(${path + logo})` : "",
      }}
    >
      <div>{weight > 0 && <div className="weight-text">{weight}</div>}</div>
    </div>
  );
};

export default Node;
