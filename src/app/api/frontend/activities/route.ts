import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const locale = (searchParams.get('locale') as 'en' | 'fr') || 'en'
    const limit = parseInt(searchParams.get('limit') || '50')

    const payload = await getPayload({ config })

    const result = await payload.find({
      collection: 'activities',
      where: {
        isActive: { equals: true },
      },
      sort: 'displayOrder',
      locale,
      depth: 2,
      limit,
    })

    // Add caching headers for better performance
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json({ docs: [], error: 'Failed to fetch activities' }, { status: 500 })
  }
}
