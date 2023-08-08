import React, { useEffect, useState } from "react";
import Node from "./Node";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { runAlgo } from "./utils/algorithms";
import "./Grid.css";

const DEFAULT_GRID_SIZE = 10; // square root of total grid size;
const MAX_GRID_SIZE = 50;
const ALGOS = { bfs: 0, dfs: 1, dijkstra: 2, aStar: 3 };
const ANIMATION_TYPE = { swarm: 0, fade: 1 };

const algoToString = (algo) => {
  let algoString = "";
  if (algo === ALGOS.bfs) algoString = "Breadth-First Search";
  else if (algo === ALGOS.dfs) algoString = "Depth-First Search";
  else if (algo === ALGOS.dijkstra) algoString = "Dijkstra Shortest Path";
  else if (algo === ALGOS.aStar) algoString = "A* Shortest Path";
  return algoString;
};

const animationTypeToString = (animationType) => {
  let animationTypeString = "";
  if (animationType === ANIMATION_TYPE.swarm) animationTypeString = "Swarm";
  else if (animationType === ANIMATION_TYPE.fade) animationTypeString = "Fade";
  return animationTypeString;
};

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
        weight: 0,
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

export const Grid = ({handleDarkModeInputChange}) => {
  const [grid, setGrid] = useState(createEmptyGrid(DEFAULT_GRID_SIZE));
  const [gridSize, setGridSize] = useState(DEFAULT_GRID_SIZE);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startNode, setStartNode] = useState(null);
  const [endNode, setEndNode] = useState(null);
  const [visualizationRunning, setVisualizationRunning] = useState(false);
  const [algo, setAlgo] = useState(ALGOS.bfs);
  const [animationTime, setAnimationTime] = useState(2000);
  const [animationCount, setAnimationCount] = useState(0);
  const [animationType, setAnimationType] = useState(ANIMATION_TYPE.swarm);
  const [cachedPath, setCachedPath] = useState(
    Array.from({ length: Object.keys(ALGOS).length }, () => ({
      path: [],
      failedPrevious: false,
    }))
  );

  useEffect(() => {
    const execShortestPath = async () => {
      if (algo !== ALGOS.dfs) {
        if (animationCount === cachedPath[algo].path.length - 2) {
          await visualizeShortestPath();
          setAnimationCount(0);
          setVisualizationRunning(false);
        }
      }
    };
    execShortestPath();
  }, [animationCount]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--animationTime",
      `${animationTime / 2000}s`
    );
  }, []);

  useEffect(() => {
    let newGridProps = resizeGrid(grid, gridSize);
    setGrid(newGridProps[0]);
    if (!newGridProps[1]) setStartNode(null);
    if (!newGridProps[2]) setEndNode(null);
  }, [gridSize]);

  useEffect(() => {
    if (!visualizationRunning) resetVisualization();
  }, [visualizationRunning]);

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
    setCachedPath(
      Array.from({ length: Object.keys(ALGOS).length }, () => ({
        path: [],
        failedPrevious: false,
      }))
    );
    setGrid(newGrid);
  };

  const handleNodeDrag = (row, col) => {
    if (isMouseDown && startNode && endNode) {
      const newGrid = [...grid];
      newGrid[row][col].isWall = !newGrid[row][col].isWall;
      setCachedPath(
        Array.from({ length: Object.keys(ALGOS).length }, () => ({
          path: [],
          failedPrevious: false,
        }))
      );
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
    setCachedPath(
      Array.from({ length: Object.keys(ALGOS).length }, () => ({
        path: [],
        failedPrevious: false,
      }))
    );
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
    let algo = null;
    switch (e.target.value) {
      case "bfs":
        algo = ALGOS.bfs;
        break;
      case "dfs":
        algo = ALGOS.dfs;
        break;
      case "dijkstra":
        algo = ALGOS.dijkstra;
        break;
      case "A*":
        algo = ALGOS.aStar;
        break;
      default:
        algo = ALGOS.bfs;
    }
    setAlgo(algo);
    resetVisualization();
  };

  const handleAnimationType = (e) => {
    let animationType = null;
    switch (e.target.value) {
      case "swarm":
        animationType = ANIMATION_TYPE.swarm;
        break;
      case "fade":
        animationType = ANIMATION_TYPE.fade;
        break;
      default:
        animationType = ANIMATION_TYPE.swarm;
    }
    setAnimationType(animationType);
    resetVisualization();
  };

  const changeAnimationTime = (e) => {
    setAnimationTime(e.target.value);
    document.documentElement.style.setProperty(
      "--animationTime",
      `${e.target.value / 1000}s`
    );
  };

  const changeGridSize = (e) => {
    setGridSize(parseInt(e.target.value));
    setCachedPath(
      Array.from({ length: Object.keys(ALGOS).length }, () => ({
        path: [],
        failedPrevious: false,
      }))
    );
  };

  const randomizeGrid = () => {
    const newGrid = createEmptyGrid(gridSize);
    const randomProbability = Math.random();
    const maxWalls = Math.pow(gridSize, 2) * 0.2;

    const startX = Math.round(Math.random() * (gridSize - 1));
    const startY = Math.round(Math.random() * (gridSize - 1));
    let endX = Math.round(Math.random() * (gridSize - 1));
    let endY = Math.round(Math.random() * (gridSize - 1));

    while (startX === endX && startY === endY) {
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
    setCachedPath(
      Array.from({ length: Object.keys(ALGOS).length }, () => ({
        path: [],
        failedPrevious: false,
      }))
    );
  };

  const execAlgo = async () => {
    if (!visualizationRunning) {
      if (startNode && endNode) {
        let visited = [];
        if (
          cachedPath[algo].path.length === 0 &&
          !cachedPath[algo].failedPrevious
        ) {
          let success = runAlgo(
            algo,
            grid,
            gridSize,
            startNode,
            endNode,
            visited
          );
          let newCachedPath = [...cachedPath];
          if (success) {
            await visualizeVisited(visited);
            newCachedPath[algo].path = visited;
            setCachedPath(newCachedPath);
          } else {
            newCachedPath[algo].failedPrevious = true;
            setCachedPath(newCachedPath);
            alert("No path found.");
          }
        } else if (cachedPath[algo].failedPrevious) {
          alert("No path found.");
        } else {
          await visualizeVisited(cachedPath[algo].path);
        }
        if (algo === ALGOS.dfs) setVisualizationRunning(false);
      } else {
        alert("Please select a start and end node.");
      }
    }
  };

  const visualizeVisited = (visited) => {
    setVisualizationRunning(true);
    return new Promise((resolve) => {
      visited.forEach((node, index) => {
        setTimeout(
          () => {
            setGrid((prevGrid) => {
              const newGrid = [...prevGrid];
              if (algo === ALGOS.dfs)
                newGrid[node[0]][node[1]].isShortest = true;
              else {
                newGrid[node[0]][node[1]].isVisited = true;
              }
              return newGrid;
            });
            if (index === visited.length - 1) {
              resolve();
            }
          },
          algo === ALGOS.dfs
            ? ((animationTime * 2) / visited.length) * index
            : (animationTime / 2 / visited.length) * index
        );
      });
    });
  };

  const visualizeShortestPath = () => {
    let currentNode = endNode;
    const path = [];

    while (currentNode[0] !== startNode[0] || currentNode[1] !== startNode[1]) {
      path.unshift(currentNode);
      currentNode = grid[currentNode[0]][currentNode[1]].parent;
      if (!currentNode) break;
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
    <div className="parent-container">
      <div
        className="grid-container"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        <div className="grid-caption">
          <p>
            Click two cells to set a{" "}
            <span style={{ color: "#5ef19b" }}>start</span> and{" "}
            <span style={{ color: "#fd686f" }}>end</span> node, respectively.
            <span className="info-icon">
              <FontAwesomeIcon icon={faInfoCircle}></FontAwesomeIcon>
              <span className="tooltip-text-right">
                Click on or drag your over cells to <b>draw walls</b> (
                <span style={{ color: "#5ef19b", fontWeight: "1000" }}>
                  start
                </span>{" "}
                and{" "}
                <span style={{ color: "#fd686f", fontWeight: "1000" }}>
                  end
                </span>{" "}
                nodes must be set first).
              </span>
            </span>
          </p>
          <div className="grid-caption-buttons">
            <div>
              <button
                className="random-button"
                disabled={!visualizationRunning ? false : true}
                onClick={randomizeGrid}
                style={{ color: !visualizationRunning ? "white" : "grey" }}
              >
                Random Grid
              </button>
            </div>
            <div>
              <button
                className="reset-button"
                disabled={!visualizationRunning ? false : true}
                onClick={handleResetGrid}
                style={{ color: !visualizationRunning ? "white" : "grey" }}
              >
                Reset Grid
              </button>
            </div>
          </div>
        </div>
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gridTemplateRows: `repeat(${gridSize}, 1fr)`,
            pointerEvents: `${!visualizationRunning ? "auto" : "none"}`,
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
                  weight={node.weight}
                  setAnimationCount={setAnimationCount}
                  animationType={animationType}
                  onClick={() => handleNodeClick(rowIndex, colIndex)}
                  onMouseEnter={() => handleNodeDrag(rowIndex, colIndex)}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="legend">
          <div className="legend-item">
            <span className="legend-node green"></span>
            <label className="legend-label">Start node</label>
          </div>
          <div className="legend-item">
            <span className="legend-node red"></span>
            <label className="legend-label">End node</label>
          </div>
          <div className="legend-item">
            <span className="legend-node blue"></span>
            <label className="legend-label">Wall</label>
          </div>
          <div className="legend-item">
            <span className="legend-node grey"></span>
            <label className="legend-label">Weight</label>
          </div>
        </div>
      </div>
      <div className="menu">
        <h3>Customize</h3>
        <div className="grid-size-menu">
          <label>Grid size</label>
          <div className="size-slider">
            <input
              disabled={!visualizationRunning ? false : true}
              onChange={changeGridSize}
              id="size_slider"
              type="range"
              min={DEFAULT_GRID_SIZE}
              max={MAX_GRID_SIZE}
              defaultValue={DEFAULT_GRID_SIZE}
            />
            <label>
              {gridSize}x{gridSize}
            </label>
          </div>
        </div>
        <div className="algo-menu">
          <label>
            Algorithm
            <div className="info-icon">
              <FontAwesomeIcon icon={faInfoCircle}></FontAwesomeIcon>
              <span className="tooltip-text-down">
                <ol>
                  <li>
                    BFS, Dijkstra's and A* <b>guarantee</b> the shortest path
                  </li>
                  <li>
                    DFS <b>does not guarantee</b> shortest path
                  </li>
                  <li>
                    Dijkstra's and A* <b>require weights</b> (if no weights set,
                    all weights cells default to weight of 1)
                  </li>
                  <li>
                    Dijkstra's and A* regress to a BFS if uniform weights.
                  </li>
                </ol>
              </span>
            </div>
          </label>
          <select
            disabled={!visualizationRunning ? false : true}
            name="algo"
            id="algo"
            onChange={handleAlgoChange}
            style={{ color: !visualizationRunning ? "white" : "grey" }}
          >
            {Object.keys(ALGOS).map((key, idx) => {
              return (
                <option key={idx} value={key}>
                  {algoToString(ALGOS[key])}
                </option>
              );
            })}
          </select>
        </div>
        <div className="animation-menu">
          <label>
            Animation
            <div className="info-icon">
              <FontAwesomeIcon icon={faInfoCircle}></FontAwesomeIcon>
              <span className="tooltip-text-right-animation">
                Select an animation style for the pathfinding visualizer.
              </span>
            </div>
          </label>
          <select
            disabled={!visualizationRunning ? false : true}
            name="animationType"
            id="animationType"
            onChange={handleAnimationType}
            style={{ color: !visualizationRunning ? "white" : "grey" }}
          >
            {Object.keys(ANIMATION_TYPE).map((key, idx) => {
              return (
                <option key={idx} value={key}>
                  {animationTypeToString(ANIMATION_TYPE[key])}
                </option>
              );
            })}
          </select>
        </div>
        <div className="duration-menu">
          <label>Duration</label>
          <div className="duration-slider">
            <input
              disabled={!visualizationRunning ? false : true}
              onChange={changeAnimationTime}
              id="animation_time_slider"
              type="range"
              min={0}
              max={10000}
              defaultValue={animationTime}
            />
            <label>{Math.round((animationTime / 1000) * 2)} sec</label>
          </div>
        </div>

        <div>
          <button
            className="visualize-button"
            disabled={!visualizationRunning ? false : true}
            onClick={execAlgo}
            style={{ color: !visualizationRunning ? "white" : "grey" }}
          >
            {!visualizationRunning ? "Start visualization" : "Running..."}
          </button>
        </div>
        <div className="toggle-dark-mode">
          <label className="dark-mode-label">
            <input
              className="dark-mode-checkbox"
              type="checkbox"
              onChange={handleDarkModeInputChange}
            />
            <span className="dark-mode-slider" />
          </label>
        </div>
      </div>
    </div>
  );
};

export { ALGOS, ANIMATION_TYPE };
