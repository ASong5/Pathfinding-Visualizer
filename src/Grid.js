import React, { useReducer, useState } from "react";
import { Node } from "./Node";

function reducer(state, action) {
  switch (action.type) {
    case "resize_rows": {
      return {
        ...state,
        num_rows: action.num_rows,
      };
    }
    case "resize_cols": {
      return {
        ...state,
        num_cols: action.num_cols,
      };
    }
    case "set_mouse_up_down": {
      return {
        ...state,
        is_mouse_down: !state.is_mouse_down,
      };
    }
    case "clear_grid": {
      return {
        ...state,
        clear_grid: !state.clear_grid,
      };
    }
    default:
      return state;
  }
}

const initialState = {
  num_rows: 64,
  start_coord: [],
  end_coord: [],
  is_mouse_down: false,
};

export function Grid() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isClearGrid, setIsClearGrid] = useState(false);
  const [visited, setVisited] = useState([]);

  const grid = [];
  for (let i = 0; i < state.num_rows; i++) {
    const row = [];
    for (let j = 0; j < state.num_cols; j++) {
      if (i === Math.floor(state.num_rows / 2) && j === 0) {
        row.push(
          <Node
            key={`${i}-${j}`}
            coords={[i, j]}
            startNode={true}
            endNode={false}
            is_mouse_down={state.is_mouse_down}
            is_clear={isClearGrid}
            setIsClearGrid={setIsClearGrid}
            visited={visited}
          />
        );
        state.start_coord[0] = i;
        state.start_coord[1] = j;
      } else if (i === Math.floor(state.num_rows / 2) && j === state.num_cols - 1) {
        row.push(
          <Node
            key={`${i}-${j}`}
            coords={[i, j]}
            startNode={false}
            endNode={true}
            is_mouse_down={state.is_mouse_down}
            is_clear={isClearGrid}
            setIsClearGrid={setIsClearGrid}
            visited={visited}
          />
        );
        state.end_coord[0] = i;
        state.end_coord[1] = j;
      } else
        row.push(
          <Node
            key={`${i}-${j}`}
            coords={[i, j]}
            startNode={false}
            endNode={false}
            is_mouse_down={state.is_mouse_down}
            is_clear={isClearGrid}
            setIsClearGrid={setIsClearGrid}
            visited={visited}
          />
        );
    }
    grid.push(row);
  }

  function visualizeBFS() {
    let visitedArr = [];
    visitedArr.push(state.start_coord);
    setVisited(visitedArr);
    let queue = [];
    queue.push(state.start_coord);
    while (queue.length > 0) {
      
      let current_coord = queue.shift();
      if (
        current_coord[0] === state.end_coord[0] &&
        current_coord[1] === state.end_coord[1]
      ) {
        console.log(current_coord);
        return current_coord;
      }

      let neighbours = getNeighbours(current_coord);
      for (let i = 0; i < neighbours.length; i++) {
        if (neighbours[i][0] >= 0 && neighbours[i][1] >= 0) {
          if (!isVisited(neighbours[i])) {
            queue.push(neighbours[i]);
            visitedArr.push(neighbours[i]);
            setVisited(visitedArr);
          }
        }
      }
    }
  }

  function getNeighbours(coords) {
    let neighbours = [];
    if (coords[0] + 1 < state.num_rows && coords[1] + 1 < state.num_cols) {
      neighbours.push([coords[0] - 1, coords[1]]);
      neighbours.push([coords[0], coords[1] - 1]);
      neighbours.push([coords[0] + 1, coords[1]]);
      neighbours.push([coords[0], coords[1] + 1]);
    }

    return neighbours;
  }

  function isVisited(coords) {
    for (let i = 0; i < visited.length; i++) {
      if (visited[i][0] === coords[0] && visited[i][1] === coords[1])
        return true;
    }
    return false;
  }

  function handleOnMouseDown() {
    dispatch({ type: "set_mouse_up_down" });
  }
  function handleOnMouseUp() {
    dispatch({ type: "set_mouse_up_down" });
  }
  function clearGrid() {
    setIsClearGrid(true);
  }

  return (
    <div
      className="grid-container"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        userSelect: "none",
      }}
      onMouseDown={handleOnMouseDown}
      onMouseUp={handleOnMouseUp}
    >
      <div
        className="grid"
        style={{
          border: "1px solid black",
          display: "grid",
          gridTemplateColumns: `repeat(${state.num_cols}, 1fr)`,
          gridTemplateRows: `repeat(${state.num_rows}, 1fr)`,
          width: `75vw`,
          height: `75vh`,
        }}
      >
        {grid}
      </div>
      <button onClick={clearGrid}>Clear Grid</button>
      <button onClick={visualizeBFS}>Visualize BFS</button>
    </div>
  );
}
