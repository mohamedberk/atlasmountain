'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

interface DashboardStats {
  revenue: {
    total: number
    thisMonth: number
    lastMonth: number
    growth: number
  }
  bookings: {
    total: number
    pending: number
    confirmed: number
    completed: number
    cancelled: number
    thisMonth: number
  }
  activities: number
  contacts: {
    total: number
    unread: number
  }
  recentBookings: Array<{
    id: string
    bookingReference: string
    guestName: string
    totalAmount: number
    status: string
    createdAt: string
  }>
}

const statusColors: Record<string, string> = {
  pending: '#f59e0b',
  paid: '#737373',
  confirmed: '#ff2828',
  in_progress: '#8b5cf6',
  completed: '#171717',
  cancelled: '#ef4444',
  refunded: '#6b7280',
  no_show: '#a3a3a3',
}

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  paid: 'Paid',
  confirmed: 'Confirmed',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
  no_show: 'No Show',
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/dashboard-stats')
        if (!response.ok) throw new Error('Failed to fetch stats')
        const data = await response.json()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" />
        <p>Loading dashboard...</p>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="dashboard-error">
        <p>Unable to load dashboard statistics</p>
        <p className="error-detail">{error}</p>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="custom-dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="dashboard-subtitle">Welcome back! Here's what's happening with your business.</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {/* Revenue Card */}
        <div className="stat-card revenue-card">
          <div className="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Revenue</span>
            <span className="stat-value">{formatCurrency(stats.revenue.total)}</span>
            <div className="stat-meta">
              <span className="stat-secondary">This month: {formatCurrency(stats.revenue.thisMonth)}</span>
              {stats.revenue.growth !== 0 && (
                <span className={`stat-growth ${stats.revenue.growth >= 0 ? 'positive' : 'negative'}`}>
                  {stats.revenue.growth >= 0 ? '↑' : '↓'} {Math.abs(stats.revenue.growth).toFixed(1)}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bookings Card */}
        <div className="stat-card bookings-card">
          <div className="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Bookings</span>
            <span className="stat-value">{stats.bookings.total}</span>
            <div className="stat-meta">
              <span className="stat-secondary">This month: {stats.bookings.thisMonth}</span>
            </div>
          </div>
        </div>

        {/* Pending Bookings Card */}
        <div className="stat-card pending-card">
          <div className="stat-icon warning">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Pending Bookings</span>
            <span className="stat-value">{stats.bookings.pending}</span>
            <div className="stat-meta">
              <span className="stat-secondary">Awaiting confirmation</span>
            </div>
          </div>
        </div>

        {/* Contact Submissions Card */}
        <div className="stat-card contacts-card">
          <div className="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Contact Messages</span>
            <span className="stat-value">{stats.contacts.total}</span>
            {stats.contacts.unread > 0 && (
              <div className="stat-meta">
                <span className="stat-badge">{stats.contacts.unread} unread</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="secondary-stats">
        <div className="mini-stat">
          <span className="mini-stat-value">{stats.activities}</span>
          <span className="mini-stat-label">Activities</span>
        </div>
        <div className="mini-stat">
          <span className="mini-stat-value">{stats.bookings.confirmed}</span>
          <span className="mini-stat-label">Confirmed</span>
        </div>
        <div className="mini-stat">
          <span className="mini-stat-value">{stats.bookings.completed}</span>
          <span className="mini-stat-label">Completed</span>
        </div>
      </div>

      {/* Booking Status Overview */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Booking Status Overview</h2>
        </div>
        <div className="status-bars">
          {Object.entries({
            pending: stats.bookings.pending,
            confirmed: stats.bookings.confirmed,
            completed: stats.bookings.completed,
            cancelled: stats.bookings.cancelled,
          }).map(([status, count]) => (
            <div key={status} className="status-bar-item">
              <div className="status-bar-header">
                <span className="status-name">{statusLabels[status]}</span>
                <span className="status-count">{count}</span>
              </div>
              <div className="status-bar-track">
                <div
                  className="status-bar-fill"
                  style={{
                    width: `${stats.bookings.total > 0 ? (count / stats.bookings.total) * 100 : 0}%`,
                    backgroundColor: statusColors[status],
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Recent Bookings</h2>
          <Link href="/admin/collections/bookings" className="view-all-link">
            View All
          </Link>
        </div>
        <div className="recent-bookings-table">
          {stats.recentBookings.length === 0 ? (
            <p className="no-data">No bookings yet</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Guest</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      <Link href={`/admin/collections/bookings/${booking.id}`} className="booking-ref">
                        {booking.bookingReference}
                      </Link>
                    </td>
                    <td>{booking.guestName}</td>
                    <td className="amount">{formatCurrency(booking.totalAmount)}</td>
                    <td>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: statusColors[booking.status] || '#6b7280' }}
                      >
                        {statusLabels[booking.status] || booking.status}
                      </span>
                    </td>
                    <td className="date">{formatDate(booking.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Quick Actions</h2>
        </div>
        <div className="quick-actions">
          <Link href="/admin/collections/bookings/create" className="quick-action-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New Booking
          </Link>
          <Link href="/admin/collections/activities/create" className="quick-action-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New Activity
          </Link>
          <Link href="/admin/collections/contact-submissions" className="quick-action-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            View Messages
          </Link>
          <Link href="/admin/globals/home-page" className="quick-action-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Edit Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
