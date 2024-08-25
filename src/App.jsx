import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import 'bootstrap/dist/css/bootstrap.min.css';





export default function App() {
  const hello = "Hello World von der IU Projektgruppe Software Engineering! Versionsverwaltung mit CI/CD läuft.";

  return (
    <Container fluid>
      <Row className='mt-4 py-2 px-2 justify-content-center'>
        <Col xs={12} sm={6} md={3}>
          <a href="https://www.iu.de">
            <img src="images/iu-logo.svg" alt="IU logo"/>
          </a>
        </Col>
        <Col xs={12} sm={6} md={3}>
          <h1>IU QuizApp</h1>
          <div>
            <p>
              {hello}
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  )
}

