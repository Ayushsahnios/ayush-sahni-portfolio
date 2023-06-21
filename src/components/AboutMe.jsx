import styled from "styled-components";
import { useAppContext } from "../appContext";
import { useSelector } from "react-redux";
import { selectData } from "../pages/homeSlice";
import { resume } from "../data";
import { Element } from "react-scroll";
// Data
import { moreInfo } from "../data";
// Components
import { Button, Col, Container, Row } from "react-bootstrap";
import { Title } from "./globalStyledComponents";

const StyledAboutMe = styled.section`
  p {
    font-size: 1.25rem;
  }
  .img {
    width: 18rem;
    height: 18rem;
  }
`;

export default function AboutMe() {
  const { avatar_url, bio } = useSelector(selectData);
  const { theme } = useAppContext();

  return (
    <Element name={"About"} id="about">
      <StyledAboutMe className="section">
      <Container className="text-center">
          <Container className="d-flex">
            <Title>
              <h2>About Me</h2>
              <div className="underline"></div>
            </Title>
          </Container>
          <Row className="align-items-center mt-5">
            <Col className="d-flex flex-column text-center">
              <Container>
                <p>{bio}</p>
                {moreInfo && <p>{moreInfo}</p>}
              </Container>
            </Col>
            <Col className="d-none d-md-block text-center">
              <img
                src={avatar_url}
                alt="GitHub Avatar"
                loading="lazy"
                className="mx-auto rounded-circle"
                style={{ width: "15rem", height: "15rem" }}
              />
            </Col>
          </Row>
          {resume && (
            <a href={resume}>
              <Button
                text-align= "center"
                size="lg"
                variant={theme === "light" ? "outline-dark" : "outline-light"}
                className="mt-5"
              >
                R&eacute;sum&eacute;
              </Button>
            </a>
          )}
        </Container>
      </StyledAboutMe>
    </Element>
  );
}
