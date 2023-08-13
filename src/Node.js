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
      className={classes}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      style={{
        border: `${isDarkMode ? "1px solid teal" : "1px solid #0D1117"}`,
        backgroundImage: isWall ? `url(${path + logo})` : "",
        textAlign: "center",
      }}
    >
      {weight > 0 ? `${weight}` : ""}
    </div>
  );
};

export default Node;
