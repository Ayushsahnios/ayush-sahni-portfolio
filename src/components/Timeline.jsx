import "./Timeline.css";
import { ReactComponent as WorkIcon } from "../images/work.svg";
import { ReactComponent as SchoolIcon } from "../images/school.svg";

import timelineElements from "../TimelineElement";
import { Container } from "react-bootstrap";
import { Title } from "./globalStyledComponents";
import { Element } from "react-scroll";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";

import "react-vertical-timeline-component/style.min.css";

function App() {
  let workIconStyles = { background: "#06D6A0" };
  let schoolIconStyles = { background: "#f9c74f" };

  return (
    <Element name={"Timeline"} id="Timeline">
    <Container className="text-center">
    <div>
      <Title>
        <h2 className="title">Timeline</h2>
            <div className="underline"></div>
        </Title>
      <VerticalTimeline>
        {timelineElements.map((element) => {
          let isWorkIcon = element.icon === "work";
          let showButton =
            element.buttonText !== undefined &&
            element.buttonText !== null &&
            element.buttonText !== "";

          return (
            <VerticalTimelineElement style={{color:"#61dbfb"}}
              key={element.key}
              date={element.date}
              dateClassName="date"
              iconStyle={isWorkIcon ? workIconStyles : schoolIconStyles}
              icon={isWorkIcon ? <WorkIcon /> : <SchoolIcon />}
            >
              <h3 style={{color: "grey"}} className="vertical-timeline-element-title">
                {element.title}
              </h3>
              <h5 style={{color: "grey"}} className="vertical-timeline-element-subtitle">
                {element.location}
              </h5>
              <p style={{color: "grey"}} id="description">{element.description}</p>
              {showButton && (
                <a
                  className={`button ${
                    isWorkIcon ? "workButton" : "schoolButton"
                  }`}
                  href="https://www.credly.com/badges/33225dd5-90ac-4f5e-9808-3771f8b58ec8?source=linked_in_profile"
                >
                  {element.buttonText}
                </a>
              )}
            </VerticalTimelineElement>
          );
        })}
      </VerticalTimeline>
    </div>
    </Container>
    </Element>
  );
}

export default App;