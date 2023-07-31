const isVisited = (visited, neighbour) => {
  for (let i = 0; i < visited.length; i++) {
    if (visited[i].toString() === neighbour.toString()) {
      return true;
    }
  }
  return false;
};

const getNeighbours = (node, gridSize) => {
  let neighbours = [];
  if (node[1] + 1 < gridSize) neighbours.push([node[0], node[1] + 1]);
  if (node[0] - 1 >= 0) neighbours.push([node[0] - 1, node[1]]);
  if (node[0] + 1 < gridSize) neighbours.push([node[0] + 1, node[1]]);
  if (node[1] - 1 >= 0) neighbours.push([node[0], node[1] - 1]);

  return neighbours;
};

export const execBFS = (grid, gridLength, startNode, endNode) => {
  if (!(startNode && endNode)) {
    return -1;
  }

  let visited = [];
  let queue = [];

  visited.push(startNode);
  queue.push(startNode);

  while (queue.length > 0) {
    let currNode = queue.shift();
    if (JSON.stringify(currNode) === JSON.stringify(endNode)) return visited;

    let neighbours = getNeighbours(currNode, gridLength);

    neighbours.forEach((neighbour) => {
      if (
        !isVisited(visited, neighbour) &&
        !grid[neighbour[0]][neighbour[1]].isWall
      ) {
        queue.push(neighbour);
        visited.push(neighbour);
        grid[neighbour[0]][neighbour[1]].parent = currNode;
      }
    });
  }
  return false;
};

export const execDFS = (grid, gridLength, currNode, endNode, visited) => {
  if (!(currNode && endNode)) {
    return -1;
  }
  if (JSON.stringify(currNode) === JSON.stringify(endNode)) {
    return true;
  }

  visited.push(currNode);

  let neighbours = getNeighbours(currNode, gridLength);

  for (let neighbour of neighbours) {
    if (
      !isVisited(visited, neighbour) &&
      !grid[neighbour[0]][neighbour[1]].isWall
    ) {
      if (execDFS(grid, gridLength, neighbour, endNode, visited)) {
        return true;
      }
    }
  }
  return false;
};
