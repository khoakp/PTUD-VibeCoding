import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { Navbar, Nav, Container } from 'react-bootstrap'
import StudentList from './pages/StudentList.jsx'
import AddStudent from './pages/AddStudent.jsx'
import Statistics from './pages/Statistics.jsx'

function App() {
  const location = useLocation()

  return (
    <>
      <Navbar bg="primary" variant="dark" expand="md" className="mb-4 shadow-sm">
        <Container>
          <Navbar.Brand as={Link} to="/">
            🎓 Student Management
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="main-nav" />
          <Navbar.Collapse id="main-nav">
            <Nav className="ms-auto">
              <Nav.Link
                as={Link}
                to="/"
                active={location.pathname === '/'}
              >
                Student List
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/add"
                active={location.pathname === '/add'}
              >
                Add Student
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/statistics"
                active={location.pathname === '/statistics'}
              >
                Statistics
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container>
        <Routes>
          <Route path="/" element={<StudentList />} />
          <Route path="/add" element={<AddStudent />} />
          <Route path="/statistics" element={<Statistics />} />
        </Routes>
      </Container>
    </>
  )
}

export default App
