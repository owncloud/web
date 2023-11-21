import { HttpClient } from '../../../src/http'
import mockAxios from 'jest-mock-axios'
import { z } from 'zod'
import { mock } from 'jest-mock-extended'

beforeEach(mockAxios.reset)

const schema = z.object({
  someProperty: z.string()
})

type Schema = z.infer<typeof schema>

describe('HttpClient', () => {
  test('types', async () => {
    const fn = jest.fn().mockReturnValue({ data: {} })

    const client = mock<HttpClient>({
      delete: fn,
      get: fn,
      head: fn,
      options: fn,
      patch: fn,
      post: fn,
      put: fn,
      request: fn
    })

    // delete
    {
      const { data: untypedResponse } = await client.delete('/foo')
      // @ts-expect-error untypedResponse is unknown, so we cannot access a property without casting
      untypedResponse.property

      const { data: typedResponse } = await client.delete<Schema>('/foo')
      typedResponse.someProperty

      const { data: schemaResponse } = await client.delete('/foo', { schema })
      schemaResponse.someProperty
    }

    // get
    {
      const { data: untypedResponse } = await client.get('/foo')
      // @ts-expect-error untypedResponse is unknown, so we cannot access a property without casting
      untypedResponse.property

      const { data: typedResponse } = await client.get<Schema>('/foo')
      typedResponse.someProperty

      const { data: schemaResponse } = await client.get('/foo', { schema })
      schemaResponse.someProperty
    }

    // head
    {
      const { data: untypedResponse } = await client.head('/foo')
      // @ts-expect-error untypedResponse is unknown, so we cannot access a property without casting
      untypedResponse.property

      const { data: typedResponse } = await client.head<Schema>('/foo')
      typedResponse.someProperty

      const { data: schemaResponse } = await client.head('/foo', { schema })
      schemaResponse.someProperty
    }

    // options
    {
      const { data: untypedResponse } = await client.options('/foo')
      // @ts-expect-error untypedResponse is unknown, so we cannot access a property without casting
      untypedResponse.property

      const { data: typedResponse } = await client.options<Schema>('/foo')
      typedResponse.someProperty

      const { data: schemaResponse } = await client.options('/foo', { schema })
      schemaResponse.someProperty
    }

    // patch
    {
      const { data: untypedResponse } = await client.patch('/foo')
      // @ts-expect-error untypedResponse is unknown, so we cannot access a property without casting
      untypedResponse.property

      const { data: typedResponse } = await client.patch<Schema>('/foo')
      typedResponse.someProperty

      const { data: schemaResponse } = await client.patch('/foo', null, { schema })
      schemaResponse.someProperty
    }

    // post
    {
      const { data: untypedResponse } = await client.post('/foo')
      // @ts-expect-error untypedResponse is unknown, so we cannot access a property without casting
      untypedResponse.property

      const { data: typedResponse } = await client.post<Schema>('/foo')
      typedResponse.someProperty

      const { data: schemaResponse } = await client.post('/foo', null, { schema })
      schemaResponse.someProperty
    }

    // put
    {
      const { data: untypedResponse } = await client.put('/foo')
      // @ts-expect-error untypedResponse is unknown, so we cannot access a property without casting
      untypedResponse.property

      const { data: typedResponse } = await client.put<Schema>('/foo')
      typedResponse.someProperty

      const { data: schemaResponse } = await client.put('/foo', null, { schema })
      schemaResponse.someProperty
    }

    // request
    {
      const { data: untypedResponse } = await client.request({ url: '/foo' })
      // @ts-expect-error untypedResponse is unknown, so we cannot access a property without casting
      untypedResponse.property

      const { data: typedResponse } = await client.request<Schema>({ url: '/foo' })
      typedResponse.someProperty

      const { data: schemaResponse } = await client.request({ url: '/foo', schema })
      schemaResponse.someProperty
    }
    expect(true).toBe(true)
  })
  test.each(['delete', 'get', 'head', 'options', 'patch', 'post', 'put'])('%s', (m) => {
    const client = new HttpClient()
    client[m]('url')
    mockAxios.mockResponse({ data: undefined })
    expect(mockAxios[m]).toHaveBeenCalledTimes(1)
  })

  test('request', () => {
    const client = new HttpClient()
    client.request({ method: 'get' })
    mockAxios.mockResponse({ data: undefined })
    expect(mockAxios.request).toHaveBeenCalledTimes(1)
  })

  // eslint-disable-next-line jest/no-done-callback
  test('cancel', (done) => {
    const client = new HttpClient()
    const thenFn = jest.fn()
    const catchFn = jest.fn()
    const promise = client.get('/foo').then(thenFn).catch(catchFn)
    client.cancel('foo')

    setTimeout(async () => {
      mockAxios.mockResponse({ data: 'data' }, undefined, true)
      await promise
      expect(thenFn).not.toHaveBeenCalled()
      expect(catchFn).toHaveBeenCalledWith(expect.any(mockAxios.Cancel))
      done()
    })
  })
})
