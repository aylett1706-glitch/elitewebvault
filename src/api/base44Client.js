import supabase from './supabaseClient'

function wrapResult(data, error) {
  if (error) return { error, data: null }
  return { data }
}

const functions = {
  invoke: async (name, payload = {}) => {
    try {
      if (supabase && supabase.functions && typeof supabase.functions.invoke === 'function') {
        const res = await supabase.functions.invoke(name, { body: payload })
        if (res?.error) return wrapResult(null, res.error)
        return wrapResult(res?.data ?? res)
      }

      // Fallback: call a local API route if functions aren't available in the client
      const resp = await fetch(`/api/functions/${name}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const json = await resp.json()
      return wrapResult(json)
    } catch (err) {
      console.error('base44.functions.invoke error', err)
      return wrapResult(null, err)
    }
  }
}

// Minimal auth shim mapping common `base44.auth.me()` usage to Supabase
const auth = {
  me: async () => {
    try {
      if (supabase && supabase.auth && typeof supabase.auth.getUser === 'function') {
        const { data, error } = await supabase.auth.getUser()
        if (error) return null
        return data?.user || null
      }
      return null
    } catch (err) {
      console.error('base44.auth.me error', err)
      return null
    }
  }
}

// Add convenience auth helpers used in the app
auth.logout = async (redirectUrl) => {
  try {
    if (supabase && supabase.auth && typeof supabase.auth.signOut === 'function') {
      await supabase.auth.signOut()
    }
  } catch (e) {
    console.error('logout error', e)
  }
  if (typeof window !== 'undefined' && redirectUrl) window.location.assign(redirectUrl)
}

auth.redirectToLogin = (redirectUrl) => {
  if (typeof window !== 'undefined') {
    const next = encodeURIComponent(redirectUrl || window.location.href)
    window.location.assign(`/login?next=${next}`)
  }
}

const entities = new Proxy({}, {
  get(_, tableName) {
    return {
      create: async (obj) => {
        const { data, error } = await supabase.from(tableName).insert([obj]).select()
        if (error) throw error
        return { data }
      },
      bulkCreate: async (items = []) => {
        const { data, error } = await supabase.from(tableName).insert(items).select()
        if (error) throw error
        return { data }
      },
      insert: async (obj) => {
        const { data, error } = await supabase.from(tableName).insert(Array.isArray(obj) ? obj : [obj]).select()
        if (error) throw error
        return { data }
      },
      find: async (query = {}) => {
        // support older `.find({ match: {...} })` usage
        let qb = supabase.from(tableName).select('*')
        if (query.match) {
          Object.entries(query.match).forEach(([k, v]) => qb = qb.eq(k, v))
        }
        const { data, error } = await qb
        if (error) throw error
        return Array.isArray(data) ? data : [data]
      },
      // Convenience: `list(sort, limit)` and `filter(match, sort, limit)` used widely in repo
      list: async (sort = '', limit = 100) => {
        let qb = supabase.from(tableName).select('*')
        if (sort) {
          const desc = sort.startsWith('-')
          const key = desc ? sort.slice(1) : sort
          qb = qb.order(key, { ascending: !desc })
        }
        if (limit) qb = qb.limit(Number(limit))
        const { data, error } = await qb
        if (error) throw error
        return data || []
      },
      filter: async (match = {}, sort = '', limit = 100) => {
        let qb = supabase.from(tableName).select('*')
        if (match && typeof match === 'object') {
          Object.entries(match).forEach(([k, v]) => qb = qb.eq(k, v))
        }
        if (sort) {
          const desc = sort.startsWith('-')
          const key = desc ? sort.slice(1) : sort
          qb = qb.order(key, { ascending: !desc })
        }
        if (limit) qb = qb.limit(Number(limit))
        const { data, error } = await qb
        if (error) throw error
        return data || []
      },
      get: async (id) => {
        const { data, error } = await supabase.from(tableName).select('*').eq('id', id).single()
        if (error) throw error
        return data
      },
      update: async (a, b) => {
        // Support both (id, updates) and (updates, { id } | { match })
        if (typeof a === 'string' || typeof a === 'number') {
          const id = a
          const updates = b || {}
          const { data, error } = await supabase.from(tableName).update(updates).eq('id', id).select()
          if (error) throw error
          return { data }
        }
        const updates = a || {}
        const opts = b || {}
        const { id, match } = opts
        let qb = supabase.from(tableName)
        if (id) qb = qb.update(updates).eq('id', id).select()
        else if (match) {
          qb = qb.update(updates)
          Object.entries(match).forEach(([k, v]) => qb = qb.eq(k, v))
          qb = qb.select()
        } else {
          throw new Error('update requires `id` or `match`')
        }
        const { data, error } = await qb
        if (error) throw error
        return { data }
      },
      delete: async (opts = {}) => {
        // Support delete(id) shorthand
        if (typeof opts === 'string' || typeof opts === 'number') {
          const { data, error } = await supabase.from(tableName).delete().eq('id', opts)
          if (error) throw error
          return { data }
        }
        const { id, match } = opts
        let qb = supabase.from(tableName)
        if (id) qb = qb.delete().eq('id', id)
        else if (match) {
          qb = qb.delete()
          Object.entries(match).forEach(([k, v]) => qb = qb.eq(k, v))
        } else throw new Error('delete requires `id` or `match`')
        const { data, error } = await qb
        if (error) throw error
        return { data }
      }
    }
  }
})

// Minimal integrations shim for LLM invocation. This forwards to a local API route `/api/ai/invoke`.
const integrations = {
  Core: {
    InvokeLLM: async (opts = {}) => {
      try {
        const resp = await fetch('/api/ai/invoke', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(opts)
        })
        return resp.json()
      } catch (err) {
        console.error('InvokeLLM fallback error', err)
        throw err
      }
    }
    ,
    UploadFile: async ({ file } = {}) => {
      if (!file) throw new Error('UploadFile requires a file')
      // Convert file to base64 in browser and POST to server upload endpoint
      if (typeof window === 'undefined') throw new Error('UploadFile only supported in browser')
      const arrayBuffer = await file.arrayBuffer()
      const uint8 = new Uint8Array(arrayBuffer)
      let CHUNK = 0x8000
      let binary = ''
      for (let i = 0; i < uint8.length; i += CHUNK) {
        binary += String.fromCharCode.apply(null, Array.from(uint8.subarray(i, i + CHUNK)))
      }
      const base64 = btoa(binary)
      const resp = await fetch('/api/files/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, contentType: file.type || 'application/octet-stream', data: base64 })
      })
      return resp.json()
    }
    ,
    GenerateVideo: async (opts = {}) => {
      // Video generation is provider-specific and not configured by default.
      // This returns a structured error so callers can handle it gracefully.
      return { error: 'GenerateVideo not configured. Set up a video generation provider and proxy.' }
    }
  }
}

export const base44 = { functions, entities, auth, integrations }
export default base44
