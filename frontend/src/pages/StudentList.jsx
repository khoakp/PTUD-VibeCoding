import { useState, useEffect } from 'react'
import {
  Table, Button, Modal, Form, Alert, Spinner, Badge, InputGroup, FormControl,
} from 'react-bootstrap'
import { getStudents, deleteStudent, updateStudent, getClasses, exportStudentsCSV } from '../api'

function StudentList() {
  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Search / filter
  const [search, setSearch] = useState('')

  // Edit modal state
  const [showEdit, setShowEdit] = useState(false)
  const [editForm, setEditForm] = useState({
    student_id: '',
    name: '',
    birth_year: '',
    major: '',
    gpa: '',
    class_id: '',
  })
  const [editLoading, setEditLoading] = useState(false)

  // Delete confirm modal
  const [showDelete, setShowDelete] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const res = await getStudents()
      setStudents(res.data)
      setError('')
    } catch (err) {
      setError('Failed to load students. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const fetchClasses = async () => {
    try {
      const res = await getClasses()
      setClasses(res.data)
    } catch { /* ignore */ }
  }

  useEffect(() => {
    fetchStudents()
    fetchClasses()
  }, [])

  // Auto-dismiss success message
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [successMsg])

  // ── Export CSV ──────────────────────────
  const handleExportCSV = async () => {
    try {
      const res = await exportStudentsCSV()
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'students.csv')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      setError('Failed to export CSV.')
    }
  }

  // ── Delete ──────────────────────────────
  const handleDeleteClick = (student) => {
    setDeleteTarget(student)
    setShowDelete(true)
  }

  const confirmDelete = async () => {
    try {
      await deleteStudent(deleteTarget.student_id)
      setStudents((prev) => prev.filter((s) => s.student_id !== deleteTarget.student_id))
      setSuccessMsg(`Student "${deleteTarget.name}" deleted successfully.`)
    } catch {
      setError('Failed to delete student.')
    } finally {
      setShowDelete(false)
      setDeleteTarget(null)
    }
  }

  // ── Edit ────────────────────────────────
  const handleEditClick = (student) => {
    setEditForm({
      student_id: student.student_id,
      name: student.name,
      birth_year: student.birth_year,
      major: student.major,
      gpa: student.gpa,
      class_id: student.class_id || '',
    })
    setShowEdit(true)
  }

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setEditLoading(true)
    try {
      const payload = {
        name: editForm.name,
        birth_year: parseInt(editForm.birth_year),
        major: editForm.major,
        gpa: parseFloat(editForm.gpa),
        class_id: editForm.class_id || null,
      }
      await updateStudent(editForm.student_id, payload)
      setShowEdit(false)
      setSuccessMsg(`Student "${editForm.name}" updated successfully.`)
      fetchStudents()
    } catch (err) {
      setError('Failed to update student.')
    } finally {
      setEditLoading(false)
    }
  }

  // ── Filter ──────────────────────────────
  const filtered = students.filter((s) => {
    const q = search.toLowerCase()
    return (
      s.student_id.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.major.toLowerCase().includes(q)
    )
  })

  // ── Render ──────────────────────────────
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading students...</p>
      </div>
    )
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>
          Student List <Badge bg="secondary">{filtered.length}</Badge>
        </h2>
        <div className="d-flex gap-2">
          <Button variant="outline-success" onClick={handleExportCSV}>
            📥 Export CSV
          </Button>
          <InputGroup style={{ maxWidth: 300 }}>
            <FormControl
              placeholder="Search by ID, name, major..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </div>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {successMsg && <Alert variant="success">{successMsg}</Alert>}

      {filtered.length === 0 ? (
        <Alert variant="info">No students found.</Alert>
      ) : (
        <div className="table-responsive">
          <Table striped bordered hover className="align-middle">
            <thead className="table-primary">
              <tr>
                <th>#</th>
                <th>Student ID</th>
                <th>Name</th>
                <th>Birth Year</th>
                <th>Major</th>
                <th>Class</th>
                <th>GPA</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student, idx) => (
                <tr key={student.student_id}>
                  <td>{idx + 1}</td>
                  <td><strong>{student.student_id}</strong></td>
                  <td>{student.name}</td>
                  <td>{student.birth_year}</td>
                  <td>{student.major}</td>
                  <td>{student.class_name || '—'}</td>
                  <td>
                    <Badge bg={student.gpa >= 3.5 ? 'success' : student.gpa >= 2.5 ? 'warning' : 'danger'}>
                      {student.gpa.toFixed(2)}
                    </Badge>
                  </td>
                  <td className="text-center">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2 btn-action"
                      onClick={() => handleEditClick(student)}
                    >
                      ✏️ Edit
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="btn-action"
                      onClick={() => handleDeleteClick(student)}
                    >
                      🗑️ Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* ── Edit Modal ─────────────────────── */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Student</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Student ID</Form.Label>
              <Form.Control
                type="text"
                value={editForm.student_id}
                disabled
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={editForm.name}
                onChange={handleEditChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Birth Year</Form.Label>
              <Form.Control
                type="number"
                name="birth_year"
                value={editForm.birth_year}
                onChange={handleEditChange}
                min={1950}
                max={2010}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Major</Form.Label>
              <Form.Control
                type="text"
                name="major"
                value={editForm.major}
                onChange={handleEditChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>GPA</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                name="gpa"
                value={editForm.gpa}
                onChange={handleEditChange}
                min={0}
                max={4}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Class</Form.Label>
              <Form.Select
                name="class_id"
                value={editForm.class_id}
                onChange={handleEditChange}
              >
                <option value="">— No Class —</option>
                {classes.map((c) => (
                  <option key={c.class_id} value={c.class_id}>
                    {c.class_name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEdit(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={editLoading}>
              {editLoading ? <Spinner size="sm" animation="border" /> : 'Save Changes'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ── Delete Confirm Modal ───────────── */}
      <Modal show={showDelete} onHide={() => setShowDelete(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete student{' '}
          <strong>{deleteTarget?.name}</strong> ({deleteTarget?.student_id})?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDelete(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default StudentList
