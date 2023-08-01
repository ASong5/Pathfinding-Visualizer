import React, { useEffect, useState } from "react";
import Node from "./Node";
import { execBFS, execDFS } from "./utils/algorithms";
import "./Grid.css";

const DEFAULT_GRID_SIZE = 10; // square root of total grid size;
const MAX_GRID_SIZE = 50;

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
  const [algoRunning, setAlgoRunning] = useState(false);
  const [algo, setAlgo] = useState("bfs");
  const [animationTime, setAnimationTime] = useState(2000);
  const [cachedPath, setCachedPath] = useState([]);

  useEffect(() => {
    let newGridProps = resizeGrid(grid, gridSize);
    setGrid(newGridProps[0]);
    if (!newGridProps[1]) setStartNode(null);
    if (!newGridProps[2]) setEndNode(null);
  }, [gridSize]);

  useEffect(() => {
    if (!algoRunning) resetVisualization();
  }, [algoRunning]);

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
        newGrid[row][col].isWall = false;
        setStartNode([row, col]);
      }
    } else if (!endNode) {
      if (newGrid[row][col].isStart) {
        newGrid[row][col].isStart = false;
        setStartNode(null);
      } else {
        newGrid[row][col].isEnd = true;
        newGrid[row][col].isWall = false;
        setEndNode([row, col]);
      }
    }
    setCachedPath([]);
    setGrid(newGrid);
  };

  const handleNodeDrag = (row, col) => {
    if (isMouseDown && startNode && endNode) {
      const newGrid = [...grid];
      newGrid[row][col].isWall = !newGrid[row][col].isWall;
      setCachedPath([]);
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
    setCachedPath([]);
    setStartNode(null);
    setEndNode(null);
  };

  const resetVisualization = () => {
    const newGrid = [...grid];
    for (let row of newGrid) {
      for (let node of row) {
        node.isVisited = false;
        node.isShortest = false;
      }
    }
  };

  const handleAlgoChange = (e) => {
    console.log(e.target.value);
    setAlgo(e.target.value);
    setCachedPath([]);
    resetVisualization();
  };

  const changeAnimationTime = (e) => {
    setAnimationTime(parseInt(e.target.value));
  };

  const changeGridSize = (e) => {
    setGridSize(parseInt(e.target.value));
    setCachedPath([]);
  };

  const randomizeGrid = () => {
    const newGrid = createEmptyGrid(gridSize);
    const randomProbability = Math.random();
    const maxWalls = Math.pow(gridSize, 2) * 0.2;

    const startX = Math.round(Math.random() * (gridSize - 1));
    const startY = Math.round(Math.random() * (gridSize - 1));
    let endX = Math.round(Math.random() * (gridSize - 1));
    let endY = Math.round(Math.random() * (gridSize - 1));

    while (JSON.stringify([startX, startY]) === JSON.stringify([endX, endY])) {
      endX = Math.round(Math.random() * (gridSize - 1));
      endY = Math.round(Math.random() * (gridSize - 1));
    }

    newGrid[startX][startY].isStart = true;
    newGrid[endX][endY].isEnd = true;

    const cellsToSetWall = [];
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (!newGrid[row][col].isStart && !newGrid[row][col].isEnd) {
          cellsToSetWall.push([row, col]);
        }
      }
    }

    for (let i = cellsToSetWall.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cellsToSetWall[i], cellsToSetWall[j]] = [
        cellsToSetWall[j],
        cellsToSetWall[i],
      ];
    }

    let numWalls = 0;
    for (let i = 0; i < cellsToSetWall.length && numWalls < maxWalls; i++) {
      const [row, col] = cellsToSetWall[i];
      if (Math.random() <= randomProbability) {
        newGrid[row][col].isWall = true;
        numWalls++;
      }
    }

    setStartNode([startX, startY]);
    setEndNode([endX, endY]);
    setGrid(newGrid);
    setCachedPath([]);
  };

  const execAlgo = async () => {
    if (!algoRunning) {
      let visited = [];
      switch (algo) {
        case "bfs":
          visited =
            cachedPath.length > 0
              ? cachedPath
              : execBFS(grid, gridSize, startNode, endNode);
          if (!visited) alert("No path");
          else if (visited === -1) alert("Please select a start and end node.");
          else {
            await visualizeVisited(visited);
            await visualizeShortestPath();
            setCachedPath(visited);
            setAlgoRunning(false);
          }
          break;

        case "dfs":
          let success = null;
          if (cachedPath.length === 0) {
            success = execDFS(grid, gridSize, startNode, endNode, visited);
            if (!success) alert("No Path");
            else if (success === -1)
              alert("Please select a start and end node.");
            else {
              await visualizeVisited(visited);
              setCachedPath(visited);
              setAlgoRunning(false);
            }
          } else {
            visited = cachedPath;
            await visualizeVisited(visited);
            setCachedPath(visited);
            setAlgoRunning(false);
          }

          break;
      }
    }
  };

  const visualizeVisited = (visited) => {
    setAlgoRunning(true);
    return new Promise((resolve) => {
      visited.forEach((node, index) => {
        setTimeout(
          () => {
            setGrid((prevGrid) => {
              const newGrid = [...prevGrid];
              if (algo === "dfs") newGrid[node[0]][node[1]].isShortest = true;
              else {
                newGrid[node[0]][node[1]].isVisited = true;
              }
              return newGrid;
            });
            if (index === visited.length - 1) {
              resolve();
            }
          },
          algo === "dfs"
            ? (animationTime / visited.length) * index
            : (animationTime / 2 / visited.length) * index
        );
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
    return new Promise((resolve) => {
      path.forEach((node, index) => {
        setTimeout(() => {
          setGrid((prevGrid) => {
            const newGrid = [...prevGrid];
            newGrid[node[0]][node[1]].isShortest = true;
            return newGrid;
          });
          if (index === path.length - 1) {
            resolve();
          }
        }, (animationTime / 2 / path.length) * index);
      });
    });
  };

  return (
    <div
      className="grid-container"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      style={{ pointerEvents: `${!algoRunning ? "auto" : "none"}` }}
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
          <button
            disabled={!algoRunning ? false : true}
            onClick={handleResetGrid}
          >
            Reset Grid
          </button>
        </div>
        <div>
          <button
            disabled={!algoRunning ? false : true}
            onClick={randomizeGrid}
          >
            Random Grid
          </button>
        </div>
        <div>
          <input
            disabled={!algoRunning ? false : true}
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
        <div>
          <select
            disabled={!algoRunning ? false : true}
            name="algo"
            id="algo"
            onChange={handleAlgoChange}
          >
            <option value="bfs">Breadth-First Search</option>
            <option value="dfs">Depth-First Search</option>
          </select>
        </div>
        <div>
          <button disabled={!algoRunning ? false : true} onClick={execAlgo}>
            {!algoRunning ? "Visualize It!" : "Running..."}
          </button>
        </div>
        <div>
          <input
            disabled={!algoRunning ? false : true}
            onChange={changeAnimationTime}
            id="animation_time_slider"
            type="range"
            min={0}
            max={10000}
            defaultValue={animationTime}
          />
          <label htmlFor="size_slider">
            {Math.round(animationTime / 1000)} seconds
          </label>
        </div>
      </div>
    </div>
  );
};
