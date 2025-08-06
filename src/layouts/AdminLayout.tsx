import React from 'react'

interface AdminLayoutProps {
  children: React.ReactNode
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="space-y-6">
      <div className="flex-1 bg-gray-50">
        {children}
      </div>
    </div>
  )
}

export default AdminLayout
