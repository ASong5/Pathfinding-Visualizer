import React, { useEffect, useReducer } from "react";

const initialState = {
  coords: [],
  fill_colour: "white",
  visited: false,
  is_start: false,
  is_end: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "set_start": {
      return {
        ...state,
        is_start: true,
        fill_colour: "green",
      };
    }
    case "set_end": {
      return {
        ...state,
        is_end: true,
        fill_colour: "red",
      };
    }
    case "set_wall": {
      return {
        ...state,
        fill_colour: state.fill_colour === "white" ? "grey" : "white",
      };
    }
    case "reset_node": {
      return {
        ...state,
        is_start: action.initialColor === "green" ? true : false,
        is_end: action.initialColor === "red" ? true : false,
        fill_colour: action.initialColor,
      };
    }
    case "visit_node": {
      return {
        ...state,
        fill_colour: "yellow",
      };
    }
    default:
      return state;
  }
}

export function Node({
  coords,
  startNode,
  endNode,
  is_mouse_down,
  is_clear,
  setIsClearGrid,
  visited,
}) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (is_clear) {
      const initialColor = startNode ? "green" : endNode ? "red" : "white";
      dispatch({ type: "reset_node", initialColor });
    }
  }, [is_clear, startNode, endNode]);

  useEffect(() => {
    for (let i = 0; i < visited.length; i++) {
      if (visited[i][0] === coords[0] && visited[i][1] === coords[1]) {
        dispatch({ type: "visit_node" });
      }
    }
  }, [visited, coords]);

  if (startNode && !state.is_start) {
    dispatch({ type: "set_start" });
  } else if (endNode && !state.is_end) {
    dispatch({ type: "set_end" });
  }

  function handleOnMouseEnter() {
    if (is_mouse_down && !state.is_start && !state.is_end) {
      dispatch({ type: "set_wall" });
    }
    setIsClearGrid(false);
  }

  function handleOnMouseDown() {
    if (!state.is_start && !state.is_end) {
      dispatch({ type: "set_wall" });
    }
    setIsClearGrid(false);
  }

  return (
    <div
      className="node"
      style={{
        border: "1px solid black",
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        position: "relative",
        backgroundColor: `${state.fill_colour}`,
      }}
      onMouseEnter={handleOnMouseEnter}
      onMouseDown={handleOnMouseDown}
    ></div>
  );
}
