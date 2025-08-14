import type { NextApiRequest, NextApiResponse } from 'next'
import Environment from '@/utils/environment'
import Crypto from '@/utils/crypto'
import { NextResponse } from 'next/server'
const env = new Environment()

export async function GET(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const result = await fetch('https://dummyjson.com/quotes', {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const res = await result.json()
    const data = {
      data: res.quotes,
      total: res.total,
    }

    const encryptedData = Crypto.encrypt(JSON.stringify(JSON.stringify(data)))
    // return NextResponse.json({ status: false, message: "Terjadi Kesalahan", data: encryptedData })
    return NextResponse.json({ status: true, message: "Permintaan berhasil diproses", data: encryptedData })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'failed to fetch data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
