import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function SupportTicketsList() {
    const navigate = useNavigate();
    const [tickets] = useState<any[]>([]);

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <div>
                    <h1>📨 تذاكر الدعم</h1>
                    <p>إدارة جميع تذاكر الدعم الواردة من الأعضاء</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => navigate('/')}
                >
                    العودة للرئيسية
                </button>
            </div>

            <div className="data-card">
                <div className="card-header">
                    <h3>قائمة التذاكر</h3>
                </div>
                <div className="card-body">
                    {tickets.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '60px 20px',
                            color: '#94a3b8'
                        }}>
                            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📭</div>
                            <h3 style={{
                                fontSize: '20px',
                                fontWeight: 700,
                                color: '#64748b',
                                marginBottom: '10px'
                            }}>
                                لا توجد تذاكر دعم
                            </h3>
                            <p style={{ fontSize: '15px', color: '#94a3b8', marginBottom: '24px' }}>
                                سيتم عرض جميع تذاكر الدعم الواردة من الأعضاء هنا
                            </p>
                            <button
                                className="btn btn-secondary"
                                onClick={() => navigate('/')}
                            >
                                العودة للوحة التحكم
                            </button>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>رقم التذكرة</th>
                                        <th>الموضوع</th>
                                        <th>العضو</th>
                                        <th>الأولوية</th>
                                        <th>الحالة</th>
                                        <th>التاريخ</th>
                                        <th>الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tickets.map((ticket) => (
                                        <tr key={ticket.id}>
                                            <td>{ticket.ticket_number}</td>
                                            <td>{ticket.subject}</td>
                                            <td>{ticket.member_name}</td>
                                            <td>
                                                <span className={`badge badge-${ticket.priority}`}>
                                                    {ticket.priority}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge badge-${ticket.status}`}>
                                                    {ticket.status}
                                                </span>
                                            </td>
                                            <td>{new Date(ticket.created_at).toLocaleDateString('ar-EG')}</td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-primary"
                                                    onClick={() => navigate(`/support/tickets/${ticket.ticket_number}`)}
                                                >
                                                    عرض
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
