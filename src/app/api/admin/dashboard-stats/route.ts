import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  try {
    const payload = await getPayload({ config })

    // Get current date info
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Fetch all bookings
    const allBookings = await payload.find({
      collection: 'bookings',
      limit: 0,
      depth: 0,
    })

    // Fetch this month's bookings
    const thisMonthBookings = await payload.find({
      collection: 'bookings',
      where: {
        createdAt: {
          greater_than_equal: startOfMonth.toISOString(),
        },
      },
      limit: 0,
      depth: 0,
    })

    // Fetch last month's bookings for comparison
    const lastMonthBookings = await payload.find({
      collection: 'bookings',
      where: {
        and: [
          { createdAt: { greater_than_equal: startOfLastMonth.toISOString() } },
          { createdAt: { less_than_equal: endOfLastMonth.toISOString() } },
        ],
      },
      limit: 0,
      depth: 0,
    })

    // Fetch recent bookings with details
    const recentBookings = await payload.find({
      collection: 'bookings',
      limit: 5,
      sort: '-createdAt',
      depth: 0,
    })

    // Fetch activities count
    const activities = await payload.find({
      collection: 'activities',
      limit: 0,
      depth: 0,
    })

    // Fetch contact submissions
    const contacts = await payload.find({
      collection: 'contact-submissions',
      limit: 0,
      depth: 0,
    })

    // Calculate revenue
    const calculateRevenue = (bookings: any[]) => {
      return bookings.reduce((sum, booking) => {
        // Only count paid/confirmed/completed bookings
        if (['paid', 'confirmed', 'completed', 'in_progress'].includes(booking.status)) {
          return sum + (booking.totalAmount || booking.pricing?.totalAmount || 0)
        }
        return sum
      }, 0)
    }

    const totalRevenue = calculateRevenue(allBookings.docs)
    const thisMonthRevenue = calculateRevenue(thisMonthBookings.docs)
    const lastMonthRevenue = calculateRevenue(lastMonthBookings.docs)

    // Calculate growth percentage
    const growth = lastMonthRevenue > 0
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : thisMonthRevenue > 0 ? 100 : 0

    // Count bookings by status
    const statusCounts = allBookings.docs.reduce(
      (acc, booking) => {
        const status = booking.status || 'pending'
        acc[status] = (acc[status] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    // Count unread contacts (assuming there's a 'read' or 'status' field)
    const unreadContacts = contacts.docs.filter(
      (contact: any) => !contact.read && contact.status !== 'read'
    ).length

    const stats = {
      revenue: {
        total: totalRevenue,
        thisMonth: thisMonthRevenue,
        lastMonth: lastMonthRevenue,
        growth: growth,
      },
      bookings: {
        total: allBookings.totalDocs,
        pending: statusCounts['pending'] || 0,
        paid: statusCounts['paid'] || 0,
        confirmed: statusCounts['confirmed'] || 0,
        in_progress: statusCounts['in_progress'] || 0,
        completed: statusCounts['completed'] || 0,
        cancelled: statusCounts['cancelled'] || 0,
        refunded: statusCounts['refunded'] || 0,
        thisMonth: thisMonthBookings.totalDocs,
      },
      activities: activities.totalDocs,
      contacts: {
        total: contacts.totalDocs,
        unread: unreadContacts,
      },
      recentBookings: recentBookings.docs.map((booking: any) => ({
        id: booking.id,
        bookingReference: booking.bookingReference,
        guestName: booking.guestName,
        totalAmount: booking.totalAmount || booking.pricing?.totalAmount || 0,
        status: booking.status,
        createdAt: booking.createdAt,
      })),
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    )
  }
}
