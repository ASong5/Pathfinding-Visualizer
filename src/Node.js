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
    setAnimationCount,
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

  const containerStyle = {
    border: `${isDarkMode ? "1px solid teal" : "1px solid #0D1117"}`,
    backgroundImage: isWall ? `url(${path + logo})` : "",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <div
      className={classes}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      style={{
        border: `${isDarkMode ? "1px solid teal" : "1px solid #0D1117"}`,
        backgroundImage: isWall ? `url(${path + logo})` : "",
        position: "relative",
      }}
    >
      <div>
        {weight > 0 && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: "12px"
            }}
          >
            {weight}
          </div>
        )}
      </div>
    </div>
  );
};

export default Node;
