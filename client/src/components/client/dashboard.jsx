"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

export default function Dashboard() {
  const [requests] = useState([
    {
      id: "REQ-001",
      service: "Website Development",
      status: "In Progress",
      priority: "High",
      dateRequested: "2024-01-15",
      estimatedCompletion: "2024-02-15",
      description: "Custom e-commerce website with payment integration",
    },
    {
      id: "REQ-002",
      service: "Mobile App Design",
      status: "Completed",
      priority: "Medium",
      dateRequested: "2024-01-10",
      estimatedCompletion: "2024-01-25",
      description: "UI/UX design for iOS and Android mobile application",
    },
    {
      id: "REQ-003",
      service: "SEO Optimization",
      status: "Pending",
      priority: "Low",
      dateRequested: "2024-01-20",
      estimatedCompletion: "2024-02-05",
      description: "Search engine optimization for existing website",
    },
    {
      id: "REQ-004",
      service: "Database Migration",
      status: "Cancelled",
      priority: "High",
      dateRequested: "2024-01-12",
      estimatedCompletion: "2024-01-30",
      description: "Migration from MySQL to PostgreSQL database",
    },
  ]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "In Progress":
        return <Clock className="w-5 h-5 text-blue-500" />;
      case "Pending":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case "Cancelled":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";
    switch (status) {
      case "Completed":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "In Progress":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "Pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "Cancelled":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getPriorityBadge = (priority) => {
    const baseClasses = "px-2 py-1 rounded text-xs font-medium";
    switch (priority) {
      case "High":
        return `${baseClasses} bg-red-100 text-red-700`;
      case "Medium":
        return `${baseClasses} bg-yellow-100 text-yellow-700`;
      case "Low":
        return `${baseClasses} bg-green-100 text-green-700`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-700`;
    }
  };

  const stats = {
    total: requests.length,
    completed: requests.filter((r) => r.status === "Completed").length,
    inProgress: requests.filter((r) => r.status === "In Progress").length,
    pending: requests.filter((r) => r.status === "Pending").length,
  };

  return (
    <div className="ml-64 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back! Here's an overview of your service requests.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Requests
              </p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600">
                {stats.completed}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-blue-600">
                {stats.inProgress}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">
                {stats.pending}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Recent Service Requests
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Requested
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Est. Completion
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(request.status)}
                      <span className="ml-2 text-sm font-medium text-gray-900">
                        {request.id}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {request.service}
                    </div>
                    <div className="text-sm text-gray-500">
                      {request.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(request.status)}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getPriorityBadge(request.priority)}>
                      {request.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.dateRequested}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.estimatedCompletion}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
