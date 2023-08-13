import React, { useRef, useEffect } from "react";
import { ANIMATION_TYPE } from "./Grid";

const path = process.env.PUBLIC_URL;
const logo = "/images/wall-texture.png";

const Node = React.memo(
  ({
    start,
    end,
    gridSize,
    isWall,
    isVisited,
    isShortest,
    weight,
    setAnimationCount,
    animationType,
    onClick,
    onMouseEnter,
    isDarkMode,
  }) => {
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
          border: `${isDarkMode ? "1px solid teal" : "1px solid #0D1117"}`,
          backgroundImage: isWall ? `url(${path + logo})` : "",
        }}
      >
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          <div
            style={{
              position: "absolute",
              fontSize: "8pt",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            {weight > 0 ? `${weight}` : ""}
          </div>
        </div>
      </div>
    );
  }
);

export default Node;
