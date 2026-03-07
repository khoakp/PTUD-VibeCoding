import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Button, Card, Alert, Spinner, Row, Col } from 'react-bootstrap'
import { createStudent } from '../api'

function AddStudent() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    student_id: '',
    name: '',
    birth_year: '',
    major: '',
    gpa: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = {
        student_id: form.student_id.trim(),
        name: form.name.trim(),
        birth_year: parseInt(form.birth_year),
        major: form.major.trim(),
        gpa: parseFloat(form.gpa),
      }
      await createStudent(payload)
      navigate('/')
    } catch (err) {
      if (err.response?.status === 400) {
        setError(err.response.data.detail || 'Student ID already exists.')
      } else {
        setError('Failed to add student. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Row className="justify-content-center">
      <Col md={8} lg={6}>
        <Card className="shadow-sm">
          <Card.Header as="h4" className="bg-primary text-white text-center">
            ➕ Add New Student
          </Card.Header>
          <Card.Body>
            {error && (
              <Alert variant="danger" dismissible onClose={() => setError('')}>
                {error}
              </Alert>
            )}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Student ID</Form.Label>
                <Form.Control
                  type="text"
                  name="student_id"
                  placeholder="e.g. SV021"
                  value={form.student_id}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  placeholder="e.g. Nguyen Van A"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Birth Year</Form.Label>
                    <Form.Control
                      type="number"
                      name="birth_year"
                      placeholder="e.g. 2003"
                      value={form.birth_year}
                      onChange={handleChange}
                      min={1950}
                      max={2010}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>GPA</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="gpa"
                      placeholder="0.00 - 4.00"
                      value={form.gpa}
                      onChange={handleChange}
                      min={0}
                      max={4}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-4">
                <Form.Label>Major</Form.Label>
                <Form.Control
                  type="text"
                  name="major"
                  placeholder="e.g. Computer Science"
                  value={form.major}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <div className="d-grid">
                <Button type="submit" variant="primary" size="lg" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner size="sm" animation="border" className="me-2" />
                      Adding...
                    </>
                  ) : (
                    'Add Student'
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  )
}

export default AddStudent
