/**
 * Unit tests for src/lib/api.js
 *
 * fetch is mocked globally so no real HTTP calls are made.
 */

import { loginTeacher, logoutTeacher, fetchNotes, createNote, updateNote, deleteNote } from '@/lib/api'

// ── Helpers ───────────────────────────────────────────────────────────────────

function mockFetchOk(body, status = 200) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status,
    json: async () => body,
  })
}

function mockFetchError(body, status = 401) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: false,
    status,
    json: async () => body,
  })
}

function mockFetchNetworkFailure() {
  global.fetch = jest.fn().mockRejectedValue(new Error('Network Error'))
}

const VALID_LOGIN_RESPONSE = {
  access_token: 'eyJhbGciOiJIUzI1NiJ9.test.token',
  token_type: 'bearer',
  teacher_id: 1,
  school_id: 1, // Added for VidhyaBharathi multi-tenant isolation
  name: 'Acharya Sandipani',
  email: 'sandipani.acharya@vidhyabharathi.edu',
  avatar_initials: 'AS',
  subject: 'Social Studies',
  class_assigned: '8',
  section: 'A',
  school_name: 'VidhyaBharathi',
  total_students: 30,
}

beforeEach(() => {
  localStorage.clear()
  jest.clearAllMocks()
})

// ── loginTeacher ──────────────────────────────────────────────────────────────

describe('loginTeacher', () => {
  test('LG-01: valid credentials — returns success with user object', async () => {
    mockFetchOk(VALID_LOGIN_RESPONSE)
    const result = await loginTeacher('sandipani.acharya@vidhyabharathi.edu', 'password123')
    expect(result.success).toBe(true)
    expect(result.user).toBeDefined()
    expect(result.user.name).toBe('Acharya Sandipani')
    expect(result.user.teacher_id).toBe(1)
    expect(result.user.school_id).toBe(1)
  })

  test('LG-01: valid login stores JWT token in localStorage', async () => {
    mockFetchOk(VALID_LOGIN_RESPONSE)
    await loginTeacher('sandipani.acharya@vidhyabharathi.edu', 'password123')
    expect(localStorage.getItem('vb_acharya_token')).toBe(VALID_LOGIN_RESPONSE.access_token)
  })

  test('LG-01: user id formatted as T00X', async () => {
    mockFetchOk(VALID_LOGIN_RESPONSE)
    const result = await loginTeacher('sandipani.acharya@vidhyabharathi.edu', 'password123')
    expect(result.user.id).toBe('T001')
  })

  test('LG-01: user object contains all expected fields', async () => {
    mockFetchOk(VALID_LOGIN_RESPONSE)
    const result = await loginTeacher('sandipani.acharya@vidhyabharathi.edu', 'password123')
    const user = result.user
    expect(user.name).toBe('Acharya Sandipani')
    expect(user.email).toBe('sandipani.acharya@vidhyabharathi.edu')
    expect(user.avatar).toBe('AS')
    expect(user.subject).toBe('Social Studies')
    expect(user.section).toBe('A')
  })

  test('LG-03: API 401 error with non-demo creds returns failure', async () => {
    mockFetchError({ detail: 'Invalid email or password' }, 401)
    const result = await loginTeacher('wrong@user.com', 'badpass')
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  test('LG-03: failed login does not store token', async () => {
    mockFetchError({ detail: 'Invalid email or password' }, 401)
    await loginTeacher('wrong@user.com', 'badpass')
    expect(localStorage.getItem('vb_acharya_token')).toBeNull()
  })

  test('LG-10: network failure with demo credentials returns offline user', async () => {
    mockFetchNetworkFailure()
    const result = await loginTeacher('sandipani.acharya@vidhyabharathi.edu', 'password123')
    expect(result.success).toBe(true)
    expect(result.user.name).toBe('Acharya Sandipani')
  })

  test('LG-10: network failure with demo creds stores offline token', async () => {
    mockFetchNetworkFailure()
    await loginTeacher('sandipani.acharya@vidhyabharathi.edu', 'password123')
    expect(localStorage.getItem('vb_acharya_token')).toBe('offline-demo-token')
  })

  test('network failure with non-demo credentials returns failure', async () => {
    mockFetchNetworkFailure()
    const result = await loginTeacher('other@user.com', 'badpass')
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/demo credentials/i)
  })

  test('calls correct endpoint with POST method', async () => {
    mockFetchOk(VALID_LOGIN_RESPONSE)
    await loginTeacher('sandipani.acharya@vidhyabharathi.edu', 'password123')
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/auth/login'),
      expect.objectContaining({ method: 'POST' })
    )
  })

  test('sends email and password in request body', async () => {
    mockFetchOk(VALID_LOGIN_RESPONSE)
    await loginTeacher('sandipani.acharya@vidhyabharathi.edu', 'password123')
    const callArgs = fetch.mock.calls[0][1]
    const body = JSON.parse(callArgs.body)
    expect(body.email).toBe('sandipani.acharya@vidhyabharathi.edu')
    expect(body.password).toBe('password123')
  })
})

// ── logoutTeacher ─────────────────────────────────────────────────────────────

describe('logoutTeacher', () => {
  test('removes token from localStorage', async () => {
    localStorage.setItem('vb_acharya_token', 'some-token')
    mockFetchOk({ message: 'Logged out successfully' })
    await logoutTeacher()
    expect(localStorage.getItem('vb_acharya_token')).toBeNull()
  })

  test('removes token even if API call fails', async () => {
    localStorage.setItem('vb_acharya_token', 'some-token')
    mockFetchNetworkFailure()
    await logoutTeacher()
    expect(localStorage.getItem('vb_acharya_token')).toBeNull()
  })

  test('calls logout endpoint', async () => {
    mockFetchOk({ message: 'Logged out successfully' })
    await logoutTeacher()
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/auth/logout'),
      expect.objectContaining({ method: 'POST' })
    )
  })
})

// ── Multi-Tenant Request Headers ──────────────────────────────────────────────

describe('fetchNotes (Header Injection)', () => {
  const MOCK_NOTES = [
    { id: 'N1', title: 'Fundamental Rights', chapter: 'Chapter 1', contentType: 'typed', tags: ['rights'], createdAt: '2026-05-20T00:00:00Z', updatedAt: '2026-05-20T00:00:00Z' }
  ]

  test('NT-01: returns array of notes from API', async () => {
    mockFetchOk({ notes: MOCK_NOTES, total: 1 })
    const notes = await fetchNotes()
    expect(Array.isArray(notes)).toBe(true)
    expect(notes).toHaveLength(1)
  })

  test('injects both Authorization and multi-tenant x-school-id headers', async () => {
    localStorage.setItem('vb_acharya_token', 'test-jwt-token')
    localStorage.setItem('vb_school_id', '1') // Inject tenant context
    mockFetchOk({ notes: [], total: 0 })
    
    await fetchNotes()
    
    const headers = fetch.mock.calls[0][1].headers
    expect(headers.Authorization).toBe('Bearer test-jwt-token')
    expect(headers['x-school-id']).toBe('1')
  })

  test('throws on API error', async () => {
    mockFetchError({ detail: 'Unauthorized' }, 401)
    await expect(fetchNotes()).rejects.toThrow()
  })
})

// ── createNote ────────────────────────────────────────────────────────────────

describe('createNote', () => {
  const CREATED_NOTE = {
    id: 'N4',
    title: 'New Note',
    chapter: 'Chapter 1',
    contentType: 'typed',
    tags: ['test'],
    createdAt: '2026-06-07T00:00:00Z',
    updatedAt: '2026-06-07T00:00:00Z',
  }

  test('NT-03: returns created note', async () => {
    mockFetchOk(CREATED_NOTE)
    const note = await createNote({ title: 'New Note', chapter: 'Chapter 1', contentType: 'typed' })
    expect(note.id).toBe('N4')
    expect(note.title).toBe('New Note')
  })

  test('NT-03: calls POST /api/v1/notes', async () => {
    mockFetchOk(CREATED_NOTE)
    await createNote({ title: 'Test', chapter: 'Chapter 1' })
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/notes'),
      expect.objectContaining({ method: 'POST' })
    )
  })

  test('sends correct fields in request body', async () => {
    mockFetchOk(CREATED_NOTE)
    await createNote({ title: 'Test', chapter: 'Chapter 1', contentType: 'typed', tags: ['a'] })
    const body = JSON.parse(fetch.mock.calls[0][1].body)
    expect(body.title).toBe('Test')
    expect(body.chapter).toBe('Chapter 1')
    expect(body.content_type).toBe('typed')
    expect(body.tags).toEqual(['a'])
  })
})

// ── updateNote ────────────────────────────────────────────────────────────────

describe('updateNote', () => {
  test('NT-12: strips N prefix from id in URL', async () => {
    mockFetchOk({ id: 'N2', title: 'Updated', chapter: 'Chapter 2', contentType: 'typed', tags: [], createdAt: '', updatedAt: '' })
    await updateNote('N2', { title: 'Updated' })
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/notes/2'),
      expect.objectContaining({ method: 'PUT' })
    )
  })

  test('NT-12: also works with numeric id string', async () => {
    mockFetchOk({ id: 'N5', title: 'Updated', chapter: 'Chapter 1', contentType: 'typed', tags: [], createdAt: '', updatedAt: '' })
    await updateNote('5', { title: 'Updated' })
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/notes/5'),
      expect.anything()
    )
  })
})

// ── deleteNote ────────────────────────────────────────────────────────────────

describe('deleteNote', () => {
  test('NT-13: calls DELETE with correct URL', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 204, json: async () => null })
    await deleteNote('N3')
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/notes/3'),
      expect.objectContaining({ method: 'DELETE' })
    )
  })

  test('NT-13: strips N prefix from id', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 204, json: async () => null })
    await deleteNote('N7')
    const url = fetch.mock.calls[0][0]
    expect(url).toContain('/api/v1/notes/7')
    expect(url).not.toContain('N7')
  })

  test('NT-13: returns success object', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 204, json: async () => null })
    const result = await deleteNote('N1')
    expect(result).toEqual({ success: true })
  })
})