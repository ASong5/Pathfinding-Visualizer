import React, { useEffect, useState } from "react";
import Node from "./Node";
import { execBFS } from "./utils/algorithms";
import "./Grid.css";

const DEFAULT_GRID_SIZE = 10;
const MAX_GRID_SIZE = 30;

const createEmptyGrid = (gridSize) => {
  const grid = [];
  for (let row = 0; row < gridSize; row++) {
    grid.push(
      Array.from({ length: gridSize }, () => ({
        isWall: false,
        isVisited: false,
        isStart: false,
        isEnd: false,
        isShortest: false,
        parent: [],
      }))
    );
  }
  return grid;
};

const resizeGrid = (grid, newGridSize) => {
  const oldGridSize = grid.length;
  const size = newGridSize > oldGridSize ? oldGridSize : newGridSize;
  let isStart = false;
  let isEnd = false;

  let newGrid = createEmptyGrid(newGridSize);

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (grid[row][col].isStart) {
        newGrid[row][col].isStart = true;
        isStart = true;
      } else if (grid[row][col].isEnd) {
        newGrid[row][col].isEnd = true;
        isEnd = true;
      } else if (grid[row][col].isWall) newGrid[row][col].isWall = true;
    }
  }

  return [newGrid, isStart, isEnd];
};

export const Grid = () => {
  const [grid, setGrid] = useState(createEmptyGrid(DEFAULT_GRID_SIZE));
  const [gridSize, setGridSize] = useState(DEFAULT_GRID_SIZE);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startNode, setStartNode] = useState(null);
  const [endNode, setEndNode] = useState(null);
  const [algoFinished, setAlgoFinished] = useState(false);

  useEffect(() => {
    let newGridProps = resizeGrid(grid, gridSize);
    setGrid(newGridProps[0]);
    if (!newGridProps[1]) setStartNode(null);
    if (!newGridProps[2]) setEndNode(null);
  }, [gridSize]);

  useEffect(() => {
    if (algoFinished) {
      visualizeShortestPath();
    }
  }, [algoFinished]);

  const handleNodeClick = (row, col) => {
    const newGrid = [...grid];
    if (startNode && endNode) {
      if (newGrid[row][col].isStart) {
        newGrid[row][col].isStart = false;
        setStartNode(null);
      } else if (newGrid[row][col].isEnd) {
        newGrid[row][col].isEnd = false;
        setEndNode(null);
      } else {
        newGrid[row][col].isWall = !newGrid[row][col].isWall;
      }
    } else if (!startNode) {
      if (newGrid[row][col].isEnd) {
        newGrid[row][col].isEnd = false;
        setEndNode(null);
      } else {
        newGrid[row][col].isStart = true;
        setStartNode([row, col]);
      }
    } else if (!endNode) {
      if (newGrid[row][col].isStart) {
        newGrid[row][col].isStart = false;
        setStartNode(null);
      } else {
        newGrid[row][col].isEnd = true;
        setEndNode([row, col]);
      }
    }
    setGrid(newGrid);
  };

  const handleNodeDrag = (row, col) => {
    if (isMouseDown && startNode && endNode) {
      const newGrid = [...grid];
      newGrid[row][col].isWall = !newGrid[row][col].isWall;
      setGrid(newGrid);
    }
  };

  const handleMouseDown = () => {
    setIsMouseDown(true);
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const handleResetGrid = () => {
    setGrid(createEmptyGrid(gridSize));
    setStartNode(null);
    setEndNode(null);
  };

  const changeGridSize = (e) => {
    setGridSize(parseInt(e.target.value));
  };

  const execAlgo = async () => {
    if (!algoFinished) {
      let visited = execBFS(grid, gridSize, startNode, endNode);

      if (visited !== null) {
        await visualizeVisited(visited);
        setAlgoFinished(true);
      }
    }
  };

  const visualizeVisited = (visited) => {
    return new Promise((resolve) => {
      visited.forEach((node, index) => {
        setTimeout(() => {
          setGrid((prevGrid) => {
            const newGrid = [...prevGrid];
            newGrid[node[0]][node[1]].isVisited = true;
            return newGrid;
          });
          if (index === visited.length - 1) {
            resolve();
          }
        }, (2000 / visited.length) * index);
      });
    });
  };

  const visualizeShortestPath = () => {
    let currentNode = endNode;
    const path = [];

    while (JSON.stringify(currentNode) !== JSON.stringify(startNode)) {
      path.unshift(currentNode);
      currentNode = grid[currentNode[0]][currentNode[1]].parent;
    }

    path.forEach((node, index) => {
      setTimeout(() => {
        setGrid((prevGrid) => {
          const newGrid = [...prevGrid];
          newGrid[node[0]][node[1]].isShortest = true;
          return newGrid;
        });
      }, (2000 / path.length) * index);
    });
    setAlgoFinished(false);
  };

  return (
    <div
      className="grid-container"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div style={{ display: "block" }}>
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gridTemplateRows: `repeat(${gridSize}, 1fr)`,
          }}
        >
          {grid.map((row, rowIndex) => (
            <div key={rowIndex} className="row">
              {row.map((node, colIndex) => (
                <Node
                  key={rowIndex - colIndex}
                  start={node.isStart}
                  end={node.isEnd}
                  gridSize={gridSize}
                  isWall={node.isWall}
                  isVisited={node.isVisited}
                  isShortest={node.isShortest}
                  onClick={() => handleNodeClick(rowIndex, colIndex)}
                  onMouseEnter={() => handleNodeDrag(rowIndex, colIndex)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="menu_options">
        <div>
          <button onClick={handleResetGrid}>Reset Grid</button>
        </div>
        <div>
          <button onClick={execAlgo}>Visualize It!</button>
        </div>
        <div>
          <input
            onChange={changeGridSize}
            id="size_slider"
            type="range"
            min={DEFAULT_GRID_SIZE}
            max={MAX_GRID_SIZE}
            defaultValue={DEFAULT_GRID_SIZE}
          />
          <label htmlFor="size_slider">
            {gridSize}x{gridSize}
          </label>
        </div>
      </div>
    </div>
  );
};
