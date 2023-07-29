const isVisited = (visited, neighbour) => {
  for (let i = 0; i < visited.length; i++) {
    if (visited[i].toString() === neighbour.toString()) {
      return true;
    }
  }
  return false;
};

export const execBFS = (grid, gridLength, startNode, endNode) => {
  if (!(startNode && endNode)) {
    alert("Please select a start and end node.");
    return null;
  }

  let visited = [];
  let queue = [];

  visited.push(startNode);
  queue.push(startNode);

  while (queue.length > 0) {
    let currNode = queue.shift();
    if (JSON.stringify(currNode) === JSON.stringify(endNode)) return visited;

    let neighbours = [
      [currNode[0] + 1, currNode[1]],
      [currNode[0] - 1, currNode[1]],
      [currNode[0], currNode[1] + 1],
      [currNode[0], currNode[1] - 1],
    ];

    neighbours.forEach((neighbour) => {
      if ((neighbour[0] >= 0 && neighbour[1] >= 0) && (neighbour[0] < gridLength && neighbour[1] < gridLength)) {
        if (
          !isVisited(visited, neighbour) &&
          !grid[neighbour[0]][neighbour[1]].isWall
        ) {
          queue.push(neighbour);
          visited.push(neighbour);
          grid[neighbour[0]][neighbour[1]].parent = currNode;
        }
      }
    });
  }
  alert("no path");
  return null;
};
