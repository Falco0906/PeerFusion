"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

interface Connection {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  avatar?: string;
  institution?: string;
  field_of_study?: string;
  connected_at: string;
}

interface ConnectionRequest {
  connection_id: number;
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  avatar?: string;
  institution?: string;
  field_of_study?: string;
  created_at: string;
}

export default function NetworkPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'connections' | 'requests'>('connections');
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const [connectionsRes, requestsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5051'}/api/connections`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5051'}/api/connections/requests`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (connectionsRes.ok) {
        const data = await connectionsRes.json();
        setConnections(data);
      }

      if (requestsRes.ok) {
        const data = await requestsRes.json();
        setRequests(data);
      }
    } catch (error) {
      console.error("Error fetching network data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (connectionId: number) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5051'}/api/connections/accept/${connectionId}`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  const handleRejectRequest = async (connectionId: number) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5051'}/api/connections/reject/${connectionId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  const handleRemoveConnection = async (userId: number) => {
    if (!confirm('Are you sure you want to remove this connection?')) return;

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5051'}/api/connections/${userId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.error("Error removing connection:", error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading network...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">My Network</h1>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{connections.length}</div>
              <div className="text-sm text-muted-foreground">Connections</div>
            </div>
            {requests.length > 0 && (
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{requests.length}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-border mb-6">
          <button
            onClick={() => setActiveTab('connections')}
            className={`pb-3 px-1 font-medium transition-colors ${
              activeTab === 'connections'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Connections ({connections.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-3 px-1 font-medium transition-colors relative ${
              activeTab === 'requests'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Requests ({requests.length})
            {requests.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></span>
            )}
          </button>
        </div>

        {/* Connections Tab */}
        {activeTab === 'connections' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connections.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <svg className="w-16 h-16 mx-auto text-muted-foreground opacity-50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-lg text-muted-foreground mb-2">No connections yet</p>
                <p className="text-sm text-muted-foreground">Start connecting with researchers and collaborators!</p>
                <Link 
                  href="/search" 
                  className="inline-block mt-4 px-6 py-2.5 bg-card border border-primary/30 text-primary rounded-lg hover:bg-primary/10 hover:border-primary transition-all font-medium"
                >
                  Find People
                </Link>
              </div>
            ) : (
              connections.map((connection) => (
                <div key={connection.id} className="glass-strong rounded-lg p-6 border border-border hover:border-primary/50 transition-all">
                  <Link href={`/profile/${connection.id}`}>
                    <div className="flex flex-col items-center text-center">
                      <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white font-bold text-2xl mb-3 cursor-pointer hover:opacity-80 transition-opacity">
                        {connection.first_name?.[0] || 'U'}{connection.last_name?.[0] || ''}
                      </div>
                      <h3 className="font-semibold text-foreground hover:text-primary cursor-pointer mb-1">
                        {connection.first_name} {connection.last_name}
                      </h3>
                      {connection.institution && (
                        <p className="text-sm text-muted-foreground mb-1">{connection.institution}</p>
                      )}
                      {connection.field_of_study && (
                        <p className="text-xs text-muted-foreground mb-3">{connection.field_of_study}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Connected {formatTime(connection.connected_at)}
                      </p>
                    </div>
                  </Link>
                  <div className="flex gap-2 mt-4">
                    <Link href={`/messages?user=${connection.id}`} className="btn-secondary flex-1 text-sm py-2">
                      Message
                    </Link>
                    <button
                      onClick={() => handleRemoveConnection(connection.id)}
                      className="btn-ghost text-destructive hover:bg-destructive/10 px-3"
                      title="Remove connection"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-muted-foreground opacity-50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-lg text-muted-foreground">No pending requests</p>
              </div>
            ) : (
              requests.map((request) => (
                <div key={request.connection_id} className="glass-strong rounded-lg p-6 border border-border flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Link href={`/profile/${request.id}`}>
                      <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center text-white font-bold text-xl cursor-pointer hover:opacity-80 transition-opacity">
                        {request.first_name?.[0] || 'U'}{request.last_name?.[0] || ''}
                      </div>
                    </Link>
                    <div>
                      <Link href={`/profile/${request.id}`}>
                        <h3 className="font-semibold text-foreground hover:text-primary cursor-pointer">
                          {request.first_name} {request.last_name}
                        </h3>
                      </Link>
                      {request.institution && (
                        <p className="text-sm text-muted-foreground">{request.institution}</p>
                      )}
                      {request.field_of_study && (
                        <p className="text-xs text-muted-foreground">{request.field_of_study}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTime(request.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptRequest(request.connection_id)}
                      className="btn-primary flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Accept
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request.connection_id)}
                      className="btn-secondary"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
