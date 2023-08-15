import React, { useEffect, useState } from "react";
import Node from "./Node";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { runAlgo } from "./utils/algorithms";
import "./Grid.css";

const DEFAULT_GRID_SIZE = 10; // square root of total grid size;
const MAX_GRID_SIZE = 50;
const ALGOS = { bfs: 0, dfs: 1, dijkstra: 2, aStar: 3 };
const ANIMATION_TYPE = { fade: 0, swarm: 1 };

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
      else if (grid[row][col].weight > 0)
        newGrid[row][col].weight = grid[row][col].weight;
    }
  }

  return [newGrid, isStart, isEnd];
};

export const Grid = ({ isDarkMode }) => {
  const [grid, setGrid] = useState(createEmptyGrid(DEFAULT_GRID_SIZE));
  const [gridSize, setGridSize] = useState(DEFAULT_GRID_SIZE);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startNode, setStartNode] = useState(null);
  const [endNode, setEndNode] = useState(null);
  const [visualizationRunning, setVisualizationRunning] = useState(false);
  const [isComputing, setIsComputing] = useState(false);
  const [algo, setAlgo] = useState(ALGOS.bfs);
  const [animationTime, setAnimationTime] = useState(2000);
  const [animationCount, setAnimationCount] = useState(0);
  const [animationType, setAnimationType] = useState(ANIMATION_TYPE.swarm);
  const [cachedVisited, setCachedVisited] = useState(
    Array.from({ length: Object.keys(ALGOS).length }, () => ({
      visited: [],
      path: [],
      failedPrevious: false,
    }))
  );
  const algoWorker = new Worker(
    new URL("./utils/webworker.js", import.meta.url)
  );

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--animationTime",
      `${animationTime / 2000}s`
    );

    const gridContainer = document.querySelector(".grid-container");
    gridContainer.addEventListener("animationend", handleAnimationEnd);
  }, []);

  useEffect(() => {
    const execShortestPath = async () => {
      if (algo !== ALGOS.dfs) {
        if (animationCount === cachedVisited[algo].visited.length - 2) {
          /*
          settimeout needed because if animationTime === 0,
          visited and shortest visualizations happen at the 
          same time which messes things up 
          */
          setTimeout(async () => {
            await visualizeShortestPath(cachedVisited[algo].path);
            setAnimationCount(0);
            setVisualizationRunning(false);
          }, 1);
        }
      }
    };
    execShortestPath();
  }, [animationCount]);

  useEffect(() => {
    let newGridProps = resizeGrid(grid, gridSize);
    setGrid(newGridProps[0]);
    if (!newGridProps[1]) setStartNode(null);
    if (!newGridProps[2]) setEndNode(null);
  }, [gridSize]);

  useEffect(() => {
    if (!visualizationRunning) resetVisualization();
  }, [visualizationRunning]);

  const handleAnimationEnd = (e) => {
    if (
      e.target.classList.contains("visited-swarm") ||
      e.target.classList.contains("visited-fade")
    ) {
      setAnimationCount((prev) => prev + 1);
    }
  };

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
        newGrid[row][col].weight = 0;
      }
    } else if (!startNode) {
      if (newGrid[row][col].isEnd) {
        newGrid[row][col].isEnd = false;
        setEndNode(null);
      } else {
        newGrid[row][col].isStart = true;
        newGrid[row][col].isWall = false;
        newGrid[row][col].weight = 0;
        setStartNode([row, col]);
      }
    } else if (!endNode) {
      if (newGrid[row][col].isStart) {
        newGrid[row][col].isStart = false;
        setStartNode(null);
      } else {
        newGrid[row][col].isEnd = true;
        newGrid[row][col].isWall = false;
        newGrid[row][col].weight = 0;
        setEndNode([row, col]);
      }
    }
    setCachedVisited(
      Array.from({ length: Object.keys(ALGOS).length }, () => ({
        visited: [],
        path: [],
        failedPrevious: false,
      }))
    );
    setGrid(newGrid);
  };

  const handleNodeDrag = (row, col) => {
    if (isMouseDown && startNode && endNode) {
      const newGrid = [...grid];
      if (!newGrid[row][col].isStart && !newGrid[row][col].isEnd) {
        newGrid[row][col].isWall = !newGrid[row][col].isWall;
        newGrid[row][col].weight = 0;
      }
      setCachedVisited(
        Array.from({ length: Object.keys(ALGOS).length }, () => ({
          visited: [],
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
    setCachedVisited(
      Array.from({ length: Object.keys(ALGOS).length }, () => ({
        visited: [],
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
      case "aStar":
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
    setAnimationTime(parseInt(e.target.value));
    document.documentElement.style.setProperty(
      "--animationTime",
      `${e.target.value / 1000}s`
    );
  };

  const changeGridSize = (e) => {
    setGridSize(parseInt(e.target.value));
    setCachedVisited(
      Array.from({ length: Object.keys(ALGOS).length }, () => ({
        visited: [],
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
    for (let i = 0; i < cellsToSetWall.length; i++) {
      const [row, col] = cellsToSetWall[i];
      if (
        !newGrid[row][col].isStart &&
        !newGrid[row][col].isEnd &&
        !newGrid[row][col].isWall
      )
        newGrid[row][col].weight = Math.ceil(Math.random() * 10);
    }

    setStartNode([startX, startY]);
    setEndNode([endX, endY]);
    setGrid(newGrid);
    setCachedVisited(
      Array.from({ length: Object.keys(ALGOS).length }, () => ({
        visited: [],
        path: [],
        failedPrevious: false,
      }))
    );
  };

  const execAlgo = async () => {
    if (!visualizationRunning) {
      if (startNode && endNode) {
        if (
          cachedVisited[algo].visited.length === 0 &&
          !cachedVisited[algo].failedPrevious
        ) {
          setIsComputing(true);
          let resultPromise = new Promise((resolve) => {
            algoWorker.onmessage = (e) => {
              resolve(e.data);
            };
          });

          algoWorker.postMessage({
            algo: algo,
            grid: grid,
            gridSize: gridSize,
            startNode: startNode,
            endNode: endNode,
          });

          let result = await resultPromise;
          setIsComputing(false);
          let newCachedVisited = [...cachedVisited];
          if (result.success) {
            if (algo === ALGOS.dfs) {
              newCachedVisited[algo].visited = result.shortestPath;
              await visualizeVisited(result.shortestPath);
            } else {
              newCachedVisited[algo].visited = result.visited;
              newCachedVisited[algo].path = result.shortestPath;
              await visualizeVisited(result.visited);
            }
            setCachedVisited(newCachedVisited);
          } else {
            newCachedVisited[algo].failedPrevious = true;
            setCachedVisited(newCachedVisited);
            alert("No path found.");
          }
        } else if (cachedVisited[algo].failedPrevious) {
          alert("No path found.");
        } else {
          await visualizeVisited(cachedVisited[algo].visited);
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

  const visualizeShortestPath = (path) => {
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
          <div className="caption-text">
            <p>
              Click two cells to set a{" "}
              <span style={{ color: "#5ef19b" }}>start</span> and{" "}
              <span style={{ color: "#fd686f" }}>end</span> node, respectively.
              <span className="info-icon">
                <FontAwesomeIcon icon={faInfoCircle}></FontAwesomeIcon>
                <span className="tooltip-text-right">
                  Click on or drag your mouse over cells to <b>draw walls</b> (
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
          </div>
          <div className="grid-caption-buttons">
            <div>
              <button
                className="random-button"
                disabled={visualizationRunning || isComputing ? true : false}
                onClick={randomizeGrid}
                style={{ color: !visualizationRunning ? "white" : "grey" }}
              >
                Random Grid
              </button>
            </div>
            <div>
              <button
                className="reset-button"
                disabled={visualizationRunning || isComputing ? true : false}
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
            backgroundColor: `${isDarkMode ? "#0D1117" : "white"}`,
            pointerEvents: `${!visualizationRunning ? "auto" : "none"}`,
          }}
        >
          {grid.map((row, rowIndex) => (
            <div className="row" key={rowIndex}>
              {row.map((node, colIndex) => (
                <Node
                  key={rowIndex * gridSize + colIndex}
                  start={node.isStart}
                  end={node.isEnd}
                  gridSize={gridSize}
                  isWall={node.isWall}
                  isVisited={node.isVisited}
                  isShortest={node.isShortest}
                  weight={
                    algo === ALGOS.aStar || algo === ALGOS.dijkstra
                      ? node.weight
                      : 0
                  }
                  setAnimationCount={setAnimationCount}
                  animationType={animationType}
                  onClick={() => handleNodeClick(rowIndex, colIndex)}
                  onMouseEnter={() => handleNodeDrag(rowIndex, colIndex)}
                  isDarkMode={isDarkMode}
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
              disabled={visualizationRunning || isComputing ? true : false}
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
            disabled={visualizationRunning || isComputing ? true : false}
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
            disabled={
              (visualizationRunning || isComputing) && algo !== ALGOS.dfs
                ? true
                : false
            }
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
              disabled={visualizationRunning || isComputing ? true : false}
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
            disabled={
              (visualizationRunning || isComputing) && startNode && endNode
                ? true
                : false
            }
            onClick={execAlgo}
            style={{ color: !visualizationRunning ? "white" : "grey" }}
          >
            {isComputing
              ? "Computing..."
              : !visualizationRunning
              ? "Start visualization"
              : "Running..."}
          </button>
        </div>
      </div>
    </div>
  );
};

export { ALGOS, ANIMATION_TYPE };
