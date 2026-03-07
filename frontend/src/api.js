import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:8000/api',
})

export const getStudents = () => API.get('/students')
export const getStudent = (studentId) => API.get(`/students/${studentId}`)
export const createStudent = (data) => API.post('/students', data)
export const updateStudent = (studentId, data) => API.put(`/students/${studentId}`, data)
export const deleteStudent = (studentId) => API.delete(`/students/${studentId}`)

export default API
