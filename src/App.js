import { useEffect, useState } from "react";
import "./App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
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
  }, [isDarkMode]);

  return (
    <div className={"App"}>
      <div className="app-container">
        <div className="heading">
          <h3>
            Pathfinding Visualizer{" "}
            <span
              onClick={handleDarkModeInputChange}
              style={{ cursor: "pointer", marginLeft: "0.5rem" }}
              hidden={isDarkMode ? false : true}
            >
              <FontAwesomeIcon icon={faSun} color="orange"></FontAwesomeIcon>
            </span>
            <span
              onClick={handleDarkModeInputChange}
              style={{ cursor: "pointer", marginLeft: "0.5rem" }}
              hidden={isDarkMode ? true : false}
            >
              <FontAwesomeIcon icon={faMoon} color="black"></FontAwesomeIcon>
            </span>
          </h3>

          <a href="https://github.com/ASong5">
            <img
              className={isDarkMode ? "dark-gh-logo" : "gh-logo"}
              src={path + logo}
            ></img>
          </a>
        </div>
        <div className="sub-heading">
          <h1 style={{ color: "grey" }}>
            A web app that visualizes various
            <br />
            <span>
              <a
                className="link"
                href="https://en.wikipedia.org/wiki/Pathfinding"
                style={{ color: isDarkMode ? "white" : "black" }}
              >
                pathfinding algorithms
              </a>
            </span>{" "}
            for both weighted
            <br />
            and unweighted graphs.
          </h1>
        </div>
        <Grid isDarkMode={isDarkMode}></Grid>
      </div>
      <div className="footer">
        <div><h5>Made by Andrew Song - SongAndrewBMS@gmail.com</h5></div>
        <div><h5>© 2023</h5></div>
      </div>
    </div>
  );
}

export default App;
