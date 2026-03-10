import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:8000/api',
})

// Students
export const getStudents = (search) => {
  const params = search ? { search } : {}
  return API.get('/students', { params })
}
export const getStudent = (studentId) => API.get(`/students/${studentId}`)
export const createStudent = (data) => API.post('/students', data)
export const updateStudent = (studentId, data) => API.put(`/students/${studentId}`, data)
export const deleteStudent = (studentId) => API.delete(`/students/${studentId}`)

// Classes
export const getClasses = () => API.get('/classes')
export const createClass = (data) => API.post('/classes', data)

// Statistics
export const getStatistics = () => API.get('/statistics')

// Export CSV
export const exportStudentsCSV = () =>
  API.get('/students/export', { responseType: 'blob' })

export default API
