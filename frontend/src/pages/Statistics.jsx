import { useState, useEffect } from 'react'
import { Card, Table, Spinner, Alert, Row, Col, Badge } from 'react-bootstrap'
import { getStatistics } from '../api'

function Statistics() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getStatistics()
        setStats(res.data)
      } catch {
        setError('Failed to load statistics. Make sure the backend is running.')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading statistics...</p>
      </div>
    )
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>
  }

  return (
    <>
      <h2 className="mb-4">📊 Statistics</h2>

      <Row className="mb-4">
        <Col md={6} className="mb-3">
          <Card className="shadow-sm text-center h-100">
            <Card.Body>
              <Card.Title className="text-muted">Total Students</Card.Title>
              <h1 className="display-4 text-primary">{stats.total_students}</h1>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="mb-3">
          <Card className="shadow-sm text-center h-100">
            <Card.Body>
              <Card.Title className="text-muted">Average GPA</Card.Title>
              <h1 className="display-4">
                <Badge bg={stats.average_gpa >= 3.5 ? 'success' : stats.average_gpa >= 2.5 ? 'warning' : 'danger'}>
                  {stats.average_gpa.toFixed(2)}
                </Badge>
              </h1>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Header as="h5" className="bg-primary text-white">
          Students by Major
        </Card.Header>
        <Card.Body>
          <Table striped bordered hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Major</th>
                <th>Number of Students</th>
              </tr>
            </thead>
            <tbody>
              {stats.students_by_major.map((item, idx) => (
                <tr key={item.major}>
                  <td>{idx + 1}</td>
                  <td>{item.major}</td>
                  <td>
                    <Badge bg="info">{item.count}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </>
  )
}

export default Statistics
