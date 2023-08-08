import { useEffect, useState } from "react";
import "./App.css";
import { Grid } from "./Grid";

const path = process.env.PUBLIC_URL;
const logo = "/images/github-mark.png";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const handleDarkModeInputChange = () => {
    setIsDarkMode(!isDarkMode);
  };

  useEffect(() => {
    if (isDarkMode) document.body.className = "dark-mode";
    else document.body.className = "light-mode";
  });

  return (
    <div className={`App ${isDarkMode}`}>
      <div className="body-header">
        <div className="heading">
          <h3>Pathfinding Visualizer</h3>
          <div className="logo-container">
            <a href="https://github.com/ASong5">
              <img
                className={isDarkMode ? "dark-logo" : "logo"}
                src={path + logo}
              ></img>
            </a>
          </div>
        </div>
        <div className="sub-heading">
          <h1 style={{ color: "grey" }}>
            A web app that visualizes various
            <br />
            <span>
              <a
                className="link"
                href="https://en.wikipedia.org/wiki/Pathfinding"
                style={{color: isDarkMode ? "white" : "black"}}
              >
                pathfinding algorithms
              </a>
            </span>{" "}
            for both weighted
            <br />
            and unweighted graphs.
          </h1>
        </div>
        <div>
          <Grid
            handleDarkModeInputChange={handleDarkModeInputChange}
            isDarkMode={isDarkMode}
          ></Grid>
        </div>
      </div>
    </div>
  );
}

export default App;
